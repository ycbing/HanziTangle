"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { HanziPuzzle } from "@/lib/hanzi/types";
import { slotKey } from "@/lib/hanzi/types";

interface Props {
  puzzle: HanziPuzzle;
  slots: Record<string, string>;
  seconds: number;
  moves: number;
  streak: number;
  onClose: () => void;
}

function drawShareCard(
  canvas: HTMLCanvasElement,
  puzzle: HanziPuzzle,
  slots: Record<string, string>,
  seconds: number,
  moves: number,
  streak: number
) {
  const scale = 2;
  const W = 420;
  const H = 720;
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // background: emerald → teal gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#34d399");
  grad.addColorStop(1, "#14b8a6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // decorative circles
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(360, 80, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, 540, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // header
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText("字缠 Hanzi Tangle", W / 2, 64);
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const dateText = new Date(puzzle.date + "T00:00:00").toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillText(`${dateText} · 主题：${puzzle.theme}`, W / 2, 94);

  // stats
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  ctx.font = "bold 19px sans-serif";
  ctx.fillText(`⏱ ${mins}:${secs} · ${moves} 步 · 🔥 连续 ${streak} 天`, W / 2, 132);

  // the characters assembled today — big and proud
  const chars: string[] = [];
  const seen = new Set<string>();
  for (const clue of puzzle.clues) {
    for (const ch of clue.word) {
      if (!seen.has(ch)) {
        seen.add(ch);
        chars.push(ch);
      }
    }
  }
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  const boxW = 360;
  const boxH = 96;
  roundRect(ctx, (W - boxW) / 2, 158, boxW, boxH, 20);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 44px sans-serif";
  const line = chars.join(" ");
  ctx.fillText(line, W / 2, 218, boxW - 30);

  // mini grid
  const cell = 38;
  const gw = puzzle.cols * cell;
  const gh = puzzle.rows * cell;
  const ox = (W - gw) / 2;
  const oy = 290;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, ox - 10, oy - 10, gw + 20, gh + 20, 16);
  ctx.fill();
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cellP = puzzle.grid[r][c];
      const x = ox + c * cell;
      const y = oy + r * cell;
      if (!cellP) {
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        roundRect(ctx, x, y, cell, cell, 6);
        ctx.fill();
        continue;
      }
      const done = cellP.split
        ? "l" in cellP.split
          ? slots[slotKey(r, c, "l")] === cellP.split.l && slots[slotKey(r, c, "r")] === cellP.split.r
          : slots[slotKey(r, c, "t")] === cellP.split.t && slots[slotKey(r, c, "b")] === cellP.split.b
        : slots[slotKey(r, c)] === cellP.char;
      if (done) {
        ctx.fillStyle = "#fff";
        roundRect(ctx, x + 2, y + 2, cell - 4, cell - 4, 8);
        ctx.fill();
        ctx.fillStyle = "#0f766e";
        ctx.font = "bold 24px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(cellP.char, x + cell / 2, y + cell / 2 + 1);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.65)";
        roundRect(ctx, x + 4, y + 4, cell - 8, cell - 8, 8);
        ctx.stroke();
      }
    }
  }
  ctx.textBaseline = "alphabetic";

  // footer: slogan (left) + QR code (right)
  const qrUrl = `https://craftmind.cn/?date=${puzzle.date}`;
  const qrSize = 104;
  const qrX = W - 44 - qrSize;
  const qrY = oy + gh + 30;

  // QR white card
  ctx.fillStyle = "#fff";
  roundRect(ctx, qrX - 8, qrY - 6, qrSize + 16, qrSize + 16, 14);
  ctx.fill();
  const qr = QRCode.create(qrUrl, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const quiet = 2; // quiet zone modules for scannability
  const qrCell = qrSize / (n + quiet * 2);
  ctx.fillStyle = "#0f766e";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.data[r * n + c]) {
        ctx.fillRect(
          qrX + (c + quiet) * qrCell,
          qrY + (r + quiet) * qrCell,
          Math.ceil(qrCell),
          Math.ceil(qrCell)
        );
      }
    }
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "16px sans-serif";
  ctx.fillText("把拆散的偏旁拼回汉字", 40, qrY + 34);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 21px sans-serif";
  ctx.fillText("扫码挑战今天的字", 40, qrY + 72);
  ctx.textAlign = "center";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function ShareModal({ puzzle, slots, seconds, moves, streak, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawShareCard(canvas, puzzle, slots, seconds, moves, streak);
    setImgUrl(canvas.toDataURL("image/png"));
  }, [puzzle, slots, seconds, moves, streak]);

  const chars: string[] = [];
  const seen = new Set<string>();
  for (const clue of puzzle.clues) for (const ch of clue.word) if (!seen.has(ch)) { seen.add(ch); chars.push(ch); }
  const shareText = `字缠 ${puzzle.date} · ${puzzle.theme}\n用 ${moves} 步拼出了：${chars.join("")}\n⏱ ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")} · 🔥 连续 ${streak} 天\n来字缠，每天一题 → https://craftmind.cn/`;

  const doDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `hanzi-tangle-${puzzle.date}.png`;
    a.click();
  };

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;
  const doShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: "字缠 Hanzi Tangle",
        text: shareText,
        url: "https://craftmind.cn/",
      });
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <canvas ref={canvasRef} className="hidden" />
      <div className="w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-stone-800">
        {imgUrl && <img src={imgUrl} alt="成绩分享图" className="w-full rounded-2xl" />}
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={doDownload}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 font-bold text-white shadow hover:opacity-90"
          >
            ⬇ 保存图片
          </button>
          <button
            onClick={doCopy}
            className="rounded-xl bg-stone-100 py-2.5 font-semibold text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200"
          >
            {copied ? "✓ 已复制" : "📋 复制文字"}
          </button>
          {canNativeShare && (
            <button
              onClick={doShare}
              className="rounded-xl bg-stone-100 py-2.5 font-semibold text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200"
            >
              📤 系统分享
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-100 py-2.5 font-semibold text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-400"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}