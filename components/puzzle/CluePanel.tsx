"use client";

import type { HanziPuzzle } from "@/lib/hanzi/types";
import { slotKey } from "@/lib/hanzi/types";

interface Props {
  puzzle: HanziPuzzle;
  slots: Record<string, string>;
  revealedIds: number[];
  activeClue: number | null;
  revealsLeft: number;
  onSelectClue: (id: number) => void;
  onReveal: (id: number) => void;
}

export default function CluePanel({
  puzzle,
  slots,
  revealedIds,
  activeClue,
  revealsLeft,
  onSelectClue,
  onReveal,
}: Props) {
  const wordSolved = (clueId: number) => {
    const clue = puzzle.clues.find((c) => c.id === clueId);
    if (!clue) return false;
    const dr = clue.direction === "across" ? 0 : 1;
    const dc = clue.direction === "across" ? 1 : 0;
    for (let i = 0; i < clue.word.length; i++) {
      const cell = puzzle.grid[clue.row + dr * i][clue.col + dc * i];
      if (!cell) return false;
      if (cell.split) {
        if (slots[slotKey(clue.row + dr * i, clue.col + dc * i, "l")] !== cell.split.l) return false;
        if (slots[slotKey(clue.row + dr * i, clue.col + dc * i, "r")] !== cell.split.r) return false;
      } else {
        if (slots[slotKey(clue.row + dr * i, clue.col + dc * i)] !== cell.char) return false;
      }
    }
    return true;
  };

  const across = puzzle.clues.filter((c) => c.direction === "across");
  const down = puzzle.clues.filter((c) => c.direction === "down");

  const ClueRow = ({ clue }: { clue: (typeof puzzle.clues)[number] }) => {
    const solved = wordSolved(clue.id);
    const revealed = revealedIds.includes(clue.id);
    const active = activeClue === clue.id;
    return (
      <div
        onClick={() => onSelectClue(clue.id)}
        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
          active
            ? "bg-amber-100 ring-1 ring-amber-300 dark:bg-amber-400/20 dark:ring-amber-400/50"
            : "hover:bg-white/70 dark:hover:bg-white/10"
        }`}
      >
        <span className="w-5 shrink-0 text-right font-bold text-stone-400 dark:text-stone-500">
          {clue.number}
        </span>
        <span className={`flex-1 ${solved ? "text-stone-400 line-through dark:text-stone-500" : ""}`}>
          {clue.hint}
          <span className="ml-1 text-xs text-stone-400 dark:text-stone-500">
            （{clue.word.length} 字）
          </span>
        </span>
        {solved ? (
          <span className="shrink-0 font-bold text-emerald-500">✓</span>
        ) : (
          <button
            title="揭示这个词"
            onClick={(e) => {
              e.stopPropagation();
              onReveal(clue.id);
            }}
            disabled={revealed || revealsLeft <= 0}
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
              revealed
                ? "bg-teal-100 text-teal-500 dark:bg-teal-500/20"
                : revealsLeft > 0
                  ? "bg-white text-teal-600 shadow hover:bg-teal-50 dark:bg-white/10 dark:text-teal-300"
                  : "bg-stone-100 text-stone-300 dark:bg-white/5 dark:text-stone-600"
            }`}
          >
            {revealed ? "✓" : "!"}
          </button>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-teal-200/60 dark:bg-stone-800/80 dark:ring-stone-700 lg:w-72">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-stone-700 dark:text-stone-200">线索</h2>
        <span className="text-xs font-medium text-stone-400">剩 {revealsLeft} 次揭示</span>
      </div>
      {across.length > 0 && (
        <>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-teal-600 dark:text-teal-300">
            横向
          </div>
          <div className="mb-3 space-y-0.5">
            {across.map((clue) => (
              <ClueRow key={clue.id} clue={clue} />
            ))}
          </div>
        </>
      )}
      {down.length > 0 && (
        <>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-teal-600 dark:text-teal-300">
            纵向
          </div>
          <div className="space-y-0.5">
            {down.map((clue) => (
              <ClueRow key={clue.id} clue={clue} />
            ))}
          </div>
        </>
      )}
      <p className="mt-4 text-[11px] leading-relaxed text-stone-400 dark:text-stone-500">
        💡 提示：点线索可高亮对应格子；拖部件进格子，左右部件齐全就拼成一个字。
      </p>
    </aside>
  );
}