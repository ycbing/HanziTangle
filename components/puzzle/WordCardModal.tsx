"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { HanziPuzzle } from "@/lib/hanzi/types";
import { buildCharKnowledge, puzzleChars } from "@/lib/hanzi/knowledge";

interface Props {
  puzzle: HanziPuzzle;
  onClose: () => void;
}

/** 竖版字卡长图: 标题 + 每字一张卡(大字/拼音/拆分/故事/例句) + 底部二维码 */
function drawWordCardImage(canvas: HTMLCanvasElement, puzzle: HanziPuzzle) {
  const scale = 2;
  const W = 540;
  const chars = puzzleChars(puzzle.clues);
  const CARD_H = 158; // 每字卡高度
  const HEADER_H = 128;
  const FOOTER_H = 148;
  const H = HEADER_H + chars.length * CARD_H + FOOTER_H;

  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#34d399");
  grad.addColorStop(1, "#0f766e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // decorative circles
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(480, 90, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(40, H - 60, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // header
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 38px sans-serif";
  ctx.fillText("📖 今日字卡", W / 2, 62);
  ctx.font = "17px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const dateText = new Date(puzzle.date + "T00:00:00").toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  ctx.fillText(`${dateText} · 主题：${puzzle.theme} · ${chars.length} 个生字`, W / 2, 98);

  // per-char cards
  chars.forEach((ch, idx) => {
    const k = buildCharKnowledge(ch);
    const y = HEADER_H + idx * CARD_H;

    // white card
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    roundRect(ctx, 20, y + 8, W - 40, CARD_H - 16, 18);
    ctx.fill();

    // big char block (left)
    const cx = 78;
    const cy = y + 8 + (CARD_H - 16) / 2;
    ctx.fillStyle = "#0d9488";
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(ch, cx, cy - 2);
    ctx.font = "15px sans-serif";
    ctx.fillText(k.pinyin, cx, cy + 26);
    ctx.textBaseline = "alphabetic";

    // story (right, wraps to 3 lines max)
    const tx = 140;
    const tw = W - 40 - 20 - tx;
    ctx.textAlign = "left";
    ctx.fillStyle = "#334155";
    ctx.font = "15px sans-serif";
    const storyLines = wrapText(ctx, k.story, tw).slice(0, 3);
    storyLines.forEach((line, li) => {
      ctx.fillText(line, tx, y + 44 + li * 22);
    });

    // example
    ctx.fillStyle = "#0f766e";
    ctx.font = "13px sans-serif";
    const exLines = wrapText(ctx, `💬 ${k.example}`, tw).slice(0, 2);
    // example positioned below story (up to 3 story lines + 2 example lines, keep within card)
    const exY = y + 44 + Math.min(storyLines.length, 3) * 22 + 8;
    exLines.forEach((line, li) => {
      ctx.fillText(line, tx, exY + li * 19);
    });

    // words chips (single line)
    if (k.words.length > 0) {
      ctx.font = "12px sans-serif";
      let wx = tx;
      const chips = k.words.slice(0, 4);
      for (const w of chips) {
        const ww = ctx.measureText(w).width + 16;
        if (wx + ww > W - 40) break;
        ctx.fillStyle = "#ccfbf1";
        roundRect(ctx, wx, y + 8 + CARD_H - 16 - 26, ww, 20, 10);
        ctx.fill();
        ctx.fillStyle = "#0f766e";
        ctx.fillText(w, wx + 8, y + 8 + CARD_H - 16 - 11);
        ctx.textBaseline = "middle";
        ctx.fillText(w, wx + 8, y + CARD_H - 8 - 14);
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#ccfbf1";
        wx += ww + 6;
      }
    }
  });

  // footer: slogan + qr
  const qrUrl = `https://craftmind.cn/?date=${puzzle.date}`;
  const qrSize = 104;
  const qrX = W - 44 - qrSize;
  const qrY = H - FOOTER_H + 22;

  ctx.fillStyle = "#fff";
  roundRect(ctx, qrX - 8, qrY - 6, qrSize + 16, qrSize + 16, 14);
  ctx.fill();
  const qr = QRCode.create(qrUrl, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const quiet = 2;
  const qrCell = qrSize / (n + quiet * 2);
  ctx.fillStyle = "#0f766e";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.data[r * n + c]) {
        ctx.fillRect(qrX + (c + quiet) * qrCell, qrY + (r + quiet) * qrCell, Math.ceil(qrCell), Math.ceil(qrCell));
      }
    }
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "15px sans-serif";
  ctx.fillText("把拆散的偏旁拼回汉字", 40, qrY + 30);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 21px sans-serif";
  ctx.fillText("扫码学今天的字", 40, qrY + 68);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
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

export default function WordCardModal({ puzzle, onClose }: Props) {
  const [tab, setTab] = useState<"cards" | "image">("cards");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const chars = useMemo(() => puzzleChars(puzzle.clues), [puzzle]);

  useEffect(() => {
    if (tab !== "image") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWordCardImage(canvas, puzzle);
    setImgUrl(canvas.toDataURL("image/png"));
  }, [tab, puzzle]);

  const doDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `word-cards-${puzzle.date}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-stone-800">
        {/* header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-700">
          <div>
            <h2 className="text-lg font-extrabold">📖 今日字卡</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {new Date(puzzle.date + "T00:00:00").toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
              })}
              · {puzzle.theme} · {chars.length} 个生字
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-stone-100 px-5 pt-3 dark:border-stone-700">
          <button
            onClick={() => setTab("cards")}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              tab === "cards"
                ? "border-b-2 border-teal-500 text-teal-600 dark:text-teal-300"
                : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            }`}
          >
            字卡列表
          </button>
          <button
            onClick={() => setTab("image")}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              tab === "image"
                ? "border-b-2 border-teal-500 text-teal-600 dark:text-teal-300"
                : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            }`}
          >
            分享图
          </button>
        </div>

        {/* body */}
        {tab === "cards" ? (
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {chars.map((ch) => {
              const k = buildCharKnowledge(ch);
              return (
                <div
                  key={ch}
                  className="flex gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-teal-100 dark:from-stone-700/60 dark:to-stone-700/30 dark:ring-stone-600"
                >
                  <div className="flex shrink-0 flex-col items-center justify-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-4xl font-black text-white shadow">
                      {ch}
                    </div>
                    <span className="mt-1 text-sm font-bold text-teal-600 dark:text-teal-300">
                      {k.pinyin}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    {k.parts && (
                      <div className="mb-1 flex items-center gap-1.5 text-xs">
                        <span className="rounded-md bg-white px-1.5 py-0.5 font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-stone-800 dark:text-amber-300 dark:ring-amber-500/40">
                          {k.parts.l}
                        </span>
                        <span className="text-stone-400">+</span>
                        <span className="rounded-md bg-white px-1.5 py-0.5 font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-stone-800 dark:text-amber-300 dark:ring-amber-500/40">
                          {k.parts.r}
                        </span>
                        <span className="text-stone-400">=</span>
                        <span className="rounded-md bg-teal-500 px-1.5 py-0.5 font-bold text-white">
                          {ch}
                        </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-200">
                      {k.story}
                    </p>
                    <p className="mt-1.5 text-sm text-teal-700 dark:text-teal-300">
                      <span className="font-semibold">💬</span> {k.example}
                    </p>
                    {k.words.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {k.words.map((w) => (
                          <span
                            key={w}
                            className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-teal-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-600"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <canvas ref={canvasRef} className="hidden" />
            {imgUrl && (
              <img src={imgUrl} alt="字卡分享图" className="mx-auto max-h-[52vh] rounded-2xl shadow" />
            )}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={doDownload}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 font-bold text-white shadow hover:opacity-90"
              >
                ⬇ 保存字卡图（发小红书/朋友圈）
              </button>
              <p className="text-center text-xs text-stone-400">
                💡 竖版长图，直接发小红书笔记或朋友圈
              </p>
            </div>
          </div>
        )}

        {/* footer */}
        <div className="border-t border-stone-100 px-5 py-3 dark:border-stone-700">
          <p className="text-center text-xs text-stone-400">
            每天 3 分钟，把汉字拆开再拼回去 💡 craftmind.cn
          </p>
        </div>
      </div>
    </div>
  );
}