"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadSaved, loadStreak } from "@/lib/game/storage";

export interface ArchiveDay {
  date: string;
  day: number;
  theme: string;
}

export interface ArchiveMonth {
  year: number;
  month: number;
  days: (ArchiveDay | null)[];
}

const THEME_EMOJI: Record<string, string> = {
  自然: "🌿",
  天气: "☀️",
  家人: "👨‍👩‍👧",
  动物: "🐾",
  美食: "🍜",
  动作: "✋",
  心情: "💛",
  人物: "🧑",
  城市: "🏙️",
  学习: "📚",
  颜色: "🎨",
  身体: "💪",
  金属: "🔩",
  衣物: "👕",
  生活: "🏠",
};

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

export default function PuzzleArchive({ months }: { months: ArchiveMonth[] }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [best, setBest] = useState(0);
  const today = todayStr();

  useEffect(() => {
    const saved = loadSaved();
    const set = new Set<string>();
    let n = 0;
    for (const date of Object.keys(saved)) {
      if (saved[date].completed) {
        set.add(date);
        n++;
      }
    }
    setCompleted(set);
    setTotal(n);
    setBest(loadStreak().best);
  }, []);

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const weekdayHeaders = ["一", "二", "三", "四", "五", "六", "日"];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12">
      <div className="mb-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl font-black text-white shadow-lg">
          字
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">历史题库</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          每一道每日题都在这里，点任意一天重新拼。
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <div className="rounded-full bg-white/80 px-4 py-1.5 font-bold shadow-sm dark:bg-white/10">
            ✅ {total} 天完成
          </div>
          <div className="rounded-full bg-white/80 px-4 py-1.5 font-bold shadow-sm dark:bg-white/10">
            🔥 最长 {best} 天
          </div>
          <div className="rounded-full bg-white/80 px-4 py-1.5 font-bold shadow-sm dark:bg-white/10">
            📅 {months.length} 个月
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {months.map((m) => {
          const weeks = Math.ceil(m.days.length / 7);
          return (
            <div
              key={`${m.year}-${m.month}`}
              className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-stone-200/60 dark:bg-stone-800/80 dark:ring-stone-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-bold text-stone-700 dark:text-stone-200">
                  {m.year}年{monthNames[m.month]}
                </h2>
                <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
                  {m.days.filter(Boolean).length} 题
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekdayHeaders.map((w) => (
                  <div key={w} className="pb-1 text-[10px] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    {w}
                  </div>
                ))}
                {Array.from({ length: weeks * 7 }).map((_, i) => {
                  const d = m.days[i];
                  if (!d) return <div key={`blank-${i}`} />;
                  const isToday = d.date === today;
                  const done = completed.has(d.date);
                  return (
                    <Link
                      key={d.date}
                      href={`/?date=${d.date}`}
                      title={`${d.date} · ${d.theme}${done ? " · 已完成" : ""}`}
                      className={`group relative grid aspect-square place-items-center rounded-lg text-sm font-semibold transition-all hover:scale-110 ${
                        isToday
                          ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md"
                          : done
                            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/40"
                            : "bg-stone-100 text-stone-600 ring-1 ring-stone-200 hover:bg-emerald-100 dark:bg-white/5 dark:text-stone-300 dark:ring-white/10 dark:hover:bg-emerald-500/20"
                      }`}
                    >
                      <span className="text-sm">{done && !isToday ? "✓" : d.day}</span>
                      <span className="absolute bottom-0.5 text-[11px] opacity-60">
                        {THEME_EMOJI[d.theme] ?? "🧩"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-stone-400 dark:text-stone-500">
        每一题都由日期确定生成——历史上的题永远和当年一模一样。
      </p>
    </div>
  );
}