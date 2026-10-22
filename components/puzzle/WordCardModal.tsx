"use client";

import { useMemo } from "react";
import type { HanziPuzzle } from "@/lib/hanzi/types";
import { buildCharKnowledge, puzzleChars } from "@/lib/hanzi/knowledge";

interface Props {
  puzzle: HanziPuzzle;
  onClose: () => void;
}

/** 每日字卡 Modal: 通关后展示今天拼过的每个字的读音+造字故事 */
export default function WordCardModal({ puzzle, onClose }: Props) {
  const chars = useMemo(() => puzzleChars(puzzle.clues), [puzzle]);

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

        {/* cards */}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {chars.map((ch) => {
            const k = buildCharKnowledge(ch);
            return (
              <div
                key={ch}
                className="flex gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-teal-100 dark:from-stone-700/60 dark:to-stone-700/30 dark:ring-stone-600"
              >
                {/* big char */}
                <div className="flex shrink-0 flex-col items-center justify-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-4xl font-black text-white shadow">
                    {ch}
                  </div>
                  <span className="mt-1 text-sm font-bold text-teal-600 dark:text-teal-300">
                    {k.pinyin}
                  </span>
                </div>
                {/* story */}
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