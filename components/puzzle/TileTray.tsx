"use client";

import { useRef, useState } from "react";
import type { HanziTile } from "@/lib/hanzi/types";
import { VARIANT_NOTES } from "@/lib/hanzi/characters";

interface Props {
  tiles: HanziTile[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onShuffle: () => void;
  onReset: () => void;
  onDrop: (tileId: number, r: number, c: number) => void;
}

interface DragState {
  tileId: number;
  startX: number;
  startY: number;
  dragging: boolean;
  x: number;
  y: number;
}

export default function TileTray({ tiles, selectedId, onSelect, onShuffle, onReset, onDrop }: Props) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const beginDrag = (e: React.PointerEvent, tile: HanziTile) => {
    dragRef.current = {
      tileId: tile.id,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      x: e.clientX,
      y: e.clientY,
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetic events */
    }
    setDrag(dragRef.current);
  };

  const moveDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.dragging && Math.hypot(dx, dy) > 7) {
      d.dragging = true;
    }
    if (d.dragging) {
      d.x = e.clientX;
      d.y = e.clientY;
      setDrag({ ...d });
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;

    if (d.dragging) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el?.closest?.("[data-cell]") as HTMLElement | null;
      if (cell) {
        onDrop(d.tileId, Number(cell.dataset.r), Number(cell.dataset.c));
      }
      setDrag(null);
      return;
    }

    setDrag(null);
    const tapped = (e.target as HTMLElement).closest?.("[data-tile]") as HTMLElement | null;
    if (tapped && Number(tapped.dataset.tile) === d.tileId) {
      onSelect(d.tileId);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          部件砖块（剩 {tiles.length}）
        </span>
        <div className="flex gap-2">
          <button
            onClick={onShuffle}
            className="rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-stone-600 shadow hover:bg-white dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/20"
            title="洗牌"
          >
            🔀 洗牌
          </button>
          <button
            onClick={onReset}
            className="rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-stone-600 shadow hover:bg-white dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/20"
            title="重来"
          >
            ↺ 重来
          </button>
        </div>
      </div>

      <div className="flex min-h-[76px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-teal-300 bg-white/40 p-3 dark:border-stone-700 dark:bg-white/5">
        {tiles.length === 0 && (
          <span className="text-sm italic text-stone-400 dark:text-stone-500">部件都拼完啦 — 真棒！</span>
        )}
        {tiles.map((tile) => {
          const isSelected = selectedId === tile.id;
          const origin = tile.kind === "part" ? VARIANT_NOTES[tile.label] : undefined;
          return (
            <button
              key={tile.id}
              data-tile={tile.id}
              onPointerDown={(e) => beginDrag(e, tile)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              className={`relative grid h-12 w-12 select-none place-items-center rounded-lg font-bold shadow transition-shadow sm:h-14 sm:w-14 ${
                tile.kind === "part" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              } ${
                isSelected
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white ring-2 ring-teal-500 ring-offset-2"
                  : tile.kind === "part"
                    ? "bg-gradient-to-br from-teal-100 to-emerald-200 text-teal-900 hover:shadow-md dark:from-teal-500/60 dark:to-emerald-600/60 dark:text-white"
                    : "bg-gradient-to-br from-amber-200 to-orange-200 text-stone-800 hover:shadow-md dark:from-amber-500/70 dark:to-orange-600/70 dark:text-white"
              }`}
              style={{ touchAction: "none" }}
            >
              {tile.label}
              {origin && (
                <span className="absolute -bottom-0.5 right-0.5 text-[8px] font-normal text-stone-500/70 dark:text-white/60">
                  {origin}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {drag?.dragging && (
        <div
          className="pointer-events-none fixed z-50 grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-emerald-300 to-teal-400 text-2xl font-bold text-white shadow-2xl"
          style={{ left: drag.x - 28, top: drag.y - 28 }}
        >
          {tiles.find((t) => t.id === drag.tileId)?.label}
        </div>
      )}
    </div>
  );
}