"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadMistakes, clearMistakes, type MistakeRecord } from "@/lib/game/storage";
import { buildCharKnowledge } from "@/lib/hanzi/knowledge";

export default function NotebookPage() {
  const [records, setRecords] = useState<Record<string, MistakeRecord>>(() => loadMistakes());
  const [confirmClear, setConfirmClear] = useState(false);

  const list = useMemo(
    () =>
      Object.values(records).sort(
        (a, b) => b.count - a.count || b.lastDate.localeCompare(a.lastDate)
      ),
    [records]
  );

  const totalMistakes = list.reduce((s, r) => s + r.count, 0);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-teal-100 text-stone-800 dark:from-stone-900 dark:to-stone-950 dark:text-stone-100">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-sm text-white shadow">
            字
          </span>
          <span className="text-lg">字缠 · 生字本</span>
        </Link>
        <Link
          href="/"
          className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-semibold hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
        >
          ← 回游戏
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10">
        {/* hero */}
        <div className="mt-4 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-teal-100 dark:bg-stone-800/70 dark:ring-stone-700">
          <h1 className="text-xl font-extrabold">📖 我的生字本</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {list.length === 0
              ? "还没有拼错的字，太厉害了！"
              : `共 ${list.length} 个字拼错过 ${totalMistakes} 次 —— 多拼几次就记住啦。`}
          </p>
          {list.length > 0 && (
            <button
              onClick={() => {
                if (!confirmClear) {
                  setConfirmClear(true);
                  setTimeout(() => setConfirmClear(false), 3000);
                  return;
                }
                clearMistakes();
                setRecords({});
                setConfirmClear(false);
              }}
              className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                confirmClear
                  ? "bg-red-500 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300"
              }`}
            >
              {confirmClear ? "确认清空？" : "清空生字本"}
            </button>
          )}
        </div>

        {/* mistake cards */}
        <div className="mt-4 space-y-2.5">
          {list.map((r) => {
            const k = buildCharKnowledge(r.char);
            return (
              <div
                key={r.char}
                className="flex items-center gap-4 rounded-2xl bg-white/80 p-3.5 shadow-sm ring-1 ring-teal-100 dark:bg-stone-800/70 dark:ring-stone-700"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-red-400 text-2xl font-black text-white shadow">
                  {r.char}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">{r.char}</span>
                    <span className="text-sm font-medium text-stone-400">{k.pinyin}</span>
                    {k.words.length > 0 && (
                      <span className="truncate text-xs text-stone-500 dark:text-stone-400">
                        {k.words.slice(0, 3).join("·")}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-400">
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">
                      拼错 {r.count} 次
                    </span>
                    {r.dates.length > 1 && (
                      <span>踩过 {r.dates.length} 天</span>
                    )}
                    <span>最近 {r.lastDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="mt-10 text-center">
            <div className="text-6xl">🏆</div>
            <p className="mt-3 font-semibold text-stone-500 dark:text-stone-400">
              你是个拼字小能手！
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 font-bold text-white shadow hover:opacity-90"
            >
              再玩一局
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}