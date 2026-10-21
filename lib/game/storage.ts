"use client";

// localStorage helpers for puzzle progress + streaks

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

const KEY = "hanzi-tangle-state-v1";
const STREAK_KEY = "hanzi-tangle-streak-v1";
const SETTINGS_KEY = "hanzi-tangle-settings-v1";

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

export function loadSettings(): { dark: boolean } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { dark: false };
  } catch {
    return { dark: false };
  }
}

export function saveSettings(s: { dark: boolean }) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

export interface StreakInfo {
  current: number;
  best: number;
  lastCompleted: string | null; // YYYY-MM-DD
  history: string[]; // completed dates
}

export function loadStreak(): StreakInfo {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw
      ? JSON.parse(raw)
      : { current: 0, best: 0, lastCompleted: null, history: [] };
  } catch {
    return { current: 0, best: 0, lastCompleted: null, history: [] };
  }
}

export function saveStreak(s: StreakInfo) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(s));
  } catch {}
}

export function recordCompletion(date: string): StreakInfo {
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
  };
  saveStreak(next);
  return next;
}