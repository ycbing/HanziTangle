"use client";

// localStorage helpers for puzzle progress + streaks + notebook

export interface SavedDayState {
  slots: Record<string, string>; // slotKey -> filled label
  tray: { id: number; kind: "part" | "whole"; label: string }[];
  revealedIds: number[];
  completed: boolean;
  seconds: number;
  moves: number;
  revealsLeft: number;
}

export type SavedState = Record<string, SavedDayState>;

export interface Settings {
  dark: boolean;
  pinyin: boolean; // 显示拼音（识字辅助）
}

// 错字本: char -> 记录
export interface MistakeRecord {
  char: string;
  count: number;
  dates: string[]; // 拼错的日期 (YYYY-MM-DD), 去重
  lastDate: string;
}

const KEY = "hanzi-tangle-state-v1";
const STREAK_KEY = "hanzi-tangle-streak-v1";
const SETTINGS_KEY = "hanzi-tangle-settings-v1";
const MISTAKES_KEY = "hanzi-tangle-mistakes-v1";

export function loadSaved(): SavedState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedState) : {};
  } catch {
    return {};
  }
}

export function saveSaved(state: SavedState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const s = raw ? JSON.parse(raw) : {};
    return { dark: !!s.dark, pinyin: s.pinyin !== false }; // 默认开拼音
  } catch {
    return { dark: false, pinyin: true };
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

export function loadMistakes(): Record<string, MistakeRecord> {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MistakeRecord>) : {};
  } catch {
    return {};
  }
}

export function saveMistakes(m: Record<string, MistakeRecord>) {
  try {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(m));
  } catch {}
}

/** 记录一次拼错 (目标字 char) */
export function recordMistake(char: string, date: string) {
  const all = loadMistakes();
  const prev = all[char];
  if (prev) {
    prev.count += 1;
    if (!prev.dates.includes(date)) prev.dates.push(date);
    prev.lastDate = date;
  } else {
    all[char] = { char, count: 1, dates: [date], lastDate: date };
  }
  saveMistakes(all);
}

export function clearMistakes() {
  try {
    localStorage.removeItem(MISTAKES_KEY);
  } catch {}
}

export interface StreakInfo {
  current: number;
  best: number;
  lastCompleted: string | null; // YYYY-MM-DD
  history: string[]; // completed dates
  themes: string[]; // themes completed (for explorer badge)
}

export function loadStreak(): StreakInfo {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw
      ? {
          ...JSON.parse(raw),
          themes: JSON.parse(raw).themes ?? [],
        }
      : { current: 0, best: 0, lastCompleted: null, history: [], themes: [] };
  } catch {
    return { current: 0, best: 0, lastCompleted: null, history: [], themes: [] };
  }
}

export function saveStreak(s: StreakInfo) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(s));
  } catch {}
}

export function recordCompletion(date: string, theme?: string): StreakInfo {
  const s = loadStreak();
  if (s.history.includes(date)) return s;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });

  const newHistory = [...s.history, date].sort();
  let current = s.lastCompleted === yStr ? s.current + 1 : 1;
  if (s.lastCompleted === date) current = s.current;

  const next: StreakInfo = {
    current,
    best: Math.max(s.best, current),
    lastCompleted: date,
    history: newHistory,
    themes: theme && !s.themes.includes(theme) ? [...s.themes, theme] : s.themes,
  };
  saveStreak(next);
  return next;
}