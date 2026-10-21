"use client";

import type { HanziPuzzle, HanziTile } from "@/lib/hanzi/types";
import { slotKey } from "@/lib/hanzi/types";

interface Props {
  puzzle: HanziPuzzle;
  slots: Record<string, string>;
  revealedIds: number[];
  activeClue: number | null;
  wrongCell: { r: number; c: number; key: number } | null;
  selectedTile?: HanziTile;
  onCellClick: (r: number, c: number) => void;
}

export default function GameBoard({
  puzzle,
  slots,
  revealedIds,
  activeClue,
  wrongCell,
  selectedTile,
  onCellClick,
}: Props) {
  // cells highlighted by active clue
  const activeCells = new Set<string>();
  if (activeClue !== null) {
    const clue = puzzle.clues.find((c) => c.id === activeClue);
    if (clue) {
      const dr = clue.direction === "across" ? 0 : 1;
      const dc = clue.direction === "across" ? 1 : 0;
      for (let i = 0; i < clue.word.length; i++) {
        activeCells.add(`${clue.row + dr * i},${clue.col + dc * i}`);
      }
    }
  }

  const isRevealed = (r: number, c: number) => {
    const cell = puzzle.grid[r][c];
    if (!cell) return false;
    return cell.wordIds.some((wid) => revealedIds.includes(wid));
  };

  const cellDone = (r: number, c: number) => {
    const cell = puzzle.grid[r][c];
    if (!cell) return false;
    if (cell.split) {
      return (
        slots[slotKey(r, c, "l")] === cell.split.l &&
        slots[slotKey(r, c, "r")] === cell.split.r
      );
    }
    return slots[slotKey(r, c)] === cell.char;
  };

  // drop targets: cells with a free slot matching the selected tile
  const canAccept = (r: number, c: number) => {
    const cell = puzzle.grid[r][c];
    if (!cell || !selectedTile) return false;
    if (cell.split) {
      const lk = slotKey(r, c, "l");
      const rk = slotKey(r, c, "r");
      if (slots[lk] !== cell.split.l && selectedTile.label === cell.split.l) return true;
      if (slots[rk] !== cell.split.r && selectedTile.label === cell.split.r) return true;
      return false;
    }
    return slots[slotKey(r, c)] !== cell.char && selectedTile.label === cell.char;
  };

  return (
    <div
      className="mx-auto grid w-fit gap-1.5 rounded-2xl bg-teal-200/70 p-2 shadow-inner dark:bg-stone-800/80"
      style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
    >
      {puzzle.grid.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) {
            return (
              <div
                key={`${r}-${c}`}
                className="h-12 w-12 rounded-md bg-teal-400/30 dark:bg-stone-900 sm:h-14 sm:w-14"
              />
            );
          }
          const highlighted = activeCells.has(`${r},${c}`);
          const revealed = isRevealed(r, c);
          const done = cellDone(r, c);
          const isWrong = wrongCell ? wrongCell.r === r && wrongCell.c === c : false;
          const target = canAccept(r, c);
          const lk = slotKey(r, c, "l");
          const rk = slotKey(r, c, "r");
          const wk = slotKey(r, c);

          let bg = "bg-white/95 ring-1 ring-teal-300 dark:bg-stone-700/80 dark:ring-stone-600";
          if (revealed) bg = "bg-teal-300/80 ring-2 ring-teal-400 dark:bg-teal-500/60";
          else if (done) bg = "bg-gradient-to-br from-emerald-300 to-teal-400 shadow dark:from-emerald-500/80 dark:to-teal-600/80";
          else if (target) bg = "bg-emerald-100 ring-2 ring-emerald-400 ring-dashed dark:bg-emerald-500/15 dark:ring-emerald-400/60";
          else if (highlighted) bg = "bg-amber-100 ring-2 ring-amber-300 dark:bg-amber-400/20 dark:ring-amber-400/50";

          const lv = cell.split ? slots[lk] : undefined;
          const rv = cell.split ? slots[rk] : undefined;

          return (
            <button
              key={`${r}-${c}`}
              data-cell="1"
              data-r={r}
              data-c={c}
              onClick={() => onCellClick(r, c)}
              className={`relative grid h-12 w-12 place-items-center overflow-hidden rounded-lg sm:h-14 sm:w-14 ${bg} ${
                isWrong ? "animate-shake bg-red-400 ring-2 ring-red-500" : ""
              }`}
            >
              {cell.number !== undefined && (
                <span className="absolute left-0.5 top-0 z-10 text-[9px] font-bold text-stone-500 dark:text-stone-300">
                  {cell.number}
                </span>
              )}
              {done ? (
                <span className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
                  {cell.char}
                </span>
              ) : cell.split ? (
                // split cell: left/right slots
                <div className="flex h-full w-full">
                  <div
                    className={`grid w-1/2 place-items-center border-r border-dashed border-teal-300/70 text-lg font-bold dark:border-stone-500 ${
                      lv ? "text-amber-700 dark:text-amber-300" : "text-stone-400/60 dark:text-stone-500"
                    }`}
                  >
                    {lv ?? ""}
                  </div>
                  <div
                    className={`grid w-1/2 place-items-center text-lg font-bold ${
                      rv ? "text-amber-700 dark:text-amber-300" : "text-stone-400/60 dark:text-stone-500"
                    }`}
                  >
                    {rv ?? ""}
                  </div>
                </div>
              ) : (
                // whole cell: single slot with dashed outline
                <span className={`text-xl font-bold ${slots[wk] ? "text-amber-700 dark:text-amber-300" : "text-stone-400/50 dark:text-stone-500"}`}>
                  {slots[wk] ?? "□"}
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}