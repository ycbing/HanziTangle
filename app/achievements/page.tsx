"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getBadgeStates } from "@/lib/game/achievements";
import { loadStreak, loadMistakes } from "@/lib/game/storage";

export default function AchievementsPage() {
  const { states, streak, mistakeCount } = useMemo(() => {
    const s = loadStreak();
    return {
      states: getBadgeStates(),
      streak: s,
      mistakeCount: Object.keys(loadMistakes()).length,
    };
  }, []);

  const unlocked = states.filter((b) => b.unlocked).length;
  const total = states.length;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-teal-100 text-stone-800 dark:from-stone-900 dark:to-stone-950 dark:text-stone-100">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-sm text-white shadow">
            字
          </span>
          <span className="text-lg">字缠 · 成就</span>
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
        <div className="mt-4 rounded-3xl bg-white/80 p-6 text-center shadow-sm ring-1 ring-teal-100 dark:bg-stone-800/70 dark:ring-stone-700">
          <div className="text-5xl">🏅</div>
          <h1 className="mt-2 text-xl font-extrabold">我的成就</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            已解锁 {unlocked}/{total} 枚徽章
          </p>
          <div className="mx-auto mt-3 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
              style={{ width: `${(unlocked / total) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div>
              <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-300">
                {streak.history.length}
              </div>
              <div className="text-xs text-stone-400">完成题数</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-300">
                {streak.best}
              </div>
              <div className="text-xs text-stone-400">最长连击</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-300">
                {streak.themes.length}
              </div>
              <div className="text-xs text-stone-400">探索主题</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-300">
                {mistakeCount}
              </div>
              <div className="text-xs text-stone-400">生字本</div>
            </div>
          </div>
        </div>

        {/* badge grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {states.map(({ badge, unlocked: isUnlocked }) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center rounded-2xl p-4 text-center ring-1 transition ${
                isUnlocked
                  ? "bg-white/90 shadow-sm ring-teal-200 dark:bg-stone-800/80 dark:ring-teal-500/40"
                  : "bg-white/40 opacity-60 ring-stone-200 dark:bg-stone-800/40 dark:ring-stone-700"
              }`}
              title={badge.desc}
            >
              <div
                className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${
                  isUnlocked
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow"
                    : "bg-stone-200 grayscale dark:bg-stone-700"
                }`}
              >
                {badge.emoji}
              </div>
              <div className="mt-2 text-sm font-bold">{badge.name}</div>
              <div className="mt-0.5 text-xs text-stone-400">{badge.desc}</div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-teal-500 dark:text-teal-300">
                {isUnlocked ? "已解锁 ✓" : "未解锁"}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}