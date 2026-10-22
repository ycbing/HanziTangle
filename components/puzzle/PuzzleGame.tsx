"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { HanziPuzzle, HanziTile } from "@/lib/hanzi/types";
import { slotKey, targetSlots } from "@/lib/hanzi/types";
import {
  loadSaved,
  saveSaved,
  loadSettings,
  saveSettings,
  loadStreak,
  recordCompletion,
  recordMistake,
  type SavedDayState,
} from "@/lib/game/storage";
import GameBoard from "./GameBoard";
import TileTray from "./TileTray";
import CluePanel from "./CluePanel";
import ShareModal from "./ShareModal";
import WordCardModal from "./WordCardModal";
import TutorialModal from "./TutorialModal";

const REVEALS = 3;

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

/** initial tray: every part label needed by a split cell gets a tile instance per occurrence */
function initialTray(puzzle: HanziPuzzle): HanziTile[] {
  const tiles: HanziTile[] = [];
  let tid = 0;
  for (const s of targetSlots(puzzle)) {
    tiles.push({ id: tid++, kind: "part", label: s.label });
  }
  return tiles;
}

export default function PuzzleGame({ puzzle }: { puzzle: HanziPuzzle }) {
  const rows = puzzle.rows;
  const cols = puzzle.cols;
  const date = puzzle.date;
  const allTargets = useMemo(() => targetSlots(puzzle), [puzzle]);
  const targetMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of allTargets) m.set(t.key, t.label);
    return m;
  }, [allTargets]);

  const saved = loadSaved()[date];

  const [slots, setSlots] = useState<Record<string, string>>(() => saved?.slots ?? {});
  const [tray, setTray] = useState<HanziTile[]>(() => saved?.tray ?? initialTray(puzzle));
  const [revealedIds, setRevealedIds] = useState<number[]>(() => saved?.revealedIds ?? []);
  const [revealsLeft, setRevealsLeft] = useState<number>(() => saved?.revealsLeft ?? REVEALS);
  const [moves, setMoves] = useState<number>(() => saved?.moves ?? 0);
  const [completed, setCompleted] = useState<boolean>(() => saved?.completed ?? false);
  const [seconds, setSeconds] = useState<number>(() => saved?.seconds ?? 0);
  const [dismissed, setDismissed] = useState(false);

  const [selected, setSelected] = useState<number | null>(null);
  const [activeClue, setActiveClue] = useState<number | null>(null);
  const [wrongCell, setWrongCell] = useState<{ r: number; c: number; key: number } | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showWordCard, setShowWordCard] = useState(false);
  const [streak, setStreak] = useState(() => loadStreak());
  const [settings, setSettings] = useState(() => loadSettings());
  const [elapsed, setElapsed] = useState(0);

  // timer
  useEffect(() => {
    if (completed) return;
    const start = Date.now() - seconds * 1000;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [completed, seconds]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.dark);
    saveSettings(settings);
  }, [settings]);

  const persist = useCallback(
    (s: Partial<SavedDayState>) => {
      const all = loadSaved();
      const prev = all[date] ?? ({} as SavedDayState);
      all[date] = { ...prev, ...s };
      saveSaved(all);
    },
    [date]
  );

  // ---------- helpers ----------
  const isCorrect = useCallback(
    (sl: Record<string, string>) => {
      for (const t of allTargets) {
        if (sl[t.key] !== t.label) return false;
      }
      return true;
    },
    [allTargets]
  );

  const solvedCount = useMemo(() => {
    let n = 0;
    for (const t of allTargets) if (slots[t.key] === t.label) n++;
    return n;
  }, [slots, allTargets]);

  /** is the whole character at (r,c) complete? */
  const cellComplete = useCallback(
    (r: number, c: number) => {
      const cell = puzzle.grid[r][c];
      if (!cell) return false;
      if (cell.split) {
        return (
          slots[slotKey(r, c, "l")] === cell.split.l &&
          slots[slotKey(r, c, "r")] === cell.split.r
        );
      }
      return slots[slotKey(r, c)] === cell.char;
    },
    [puzzle, slots]
  );

  // ---------- actions ----------
  const update = useCallback(
    (next: Partial<SavedDayState>) => {
      const sl = next.slots ?? slots;
      const done = isCorrect(sl);
      setSlots(sl);
      if (next.tray) setTray(next.tray);
      if (next.revealedIds) setRevealedIds(next.revealedIds);
      if (next.moves !== undefined) setMoves(next.moves);
      if (next.revealsLeft !== undefined) setRevealsLeft(next.revealsLeft);
      if (next.seconds !== undefined) setSeconds(next.seconds);

      // persist everything through the freshest saved state
      const all = loadSaved();
      const prev = all[date] ?? ({} as SavedDayState);
      all[date] = {
        ...prev,
        slots: sl,
        tray: next.tray ?? tray,
        revealedIds: next.revealedIds ?? revealedIds,
        completed: done || completed,
        seconds: next.seconds ?? seconds,
        moves: next.moves ?? moves,
        revealsLeft: next.revealsLeft ?? revealsLeft,
      };
      saveSaved(all);

      if (done && !completed && !next.completed) {
        setCompleted(true);
        setDismissed(false);
        const st = recordCompletion(date);
        setStreak(st);
        setTimeout(() => setShowShare(true), 1200);
      }
    },
    [slots, tray, revealedIds, isCorrect, completed, date, moves, seconds, revealsLeft]
  );

  const selectedTile = selected !== null ? tray.find((t) => t.id === selected) : undefined;

  /** place the selected tile into a cell's free slot */
  const placeTile = useCallback(
    (tile: HanziTile, r: number, c: number) => {
      const cell = puzzle.grid[r]?.[c];
      if (!cell) return;
      setSelected(null);

      // decide target slot
      let key: string;
      let target: string;
      if (cell.split) {
        const lk = slotKey(r, c, "l");
        const rk = slotKey(r, c, "r");
        if (slots[lk] === cell.split.l && slots[rk] === cell.split.r) return; // already complete
        if (slots[lk] === cell.split.l) {
          key = rk;
          target = cell.split.r;
        } else {
          key = lk;
          target = cell.split.l;
        }
      } else {
        key = slotKey(r, c);
        if (slots[key] === cell.char) return;
        target = cell.char;
      }

      if (tile.label !== target) {
        setWrongCell({ r, c, key: Date.now() });
        window.setTimeout(() => setWrongCell(null), 600);
        // 错字本: 记录今天拼错的目标字
        recordMistake(cell.char, date);
        return;
      }

      // fill slot, remove one matching tile from tray (generous if already used by reveal)
      const nextSlots = { ...slots, [key]: tile.label };
      let nextTray = tray;
      const ti = tray.findIndex((t) => t.kind === tile.kind && t.label === tile.label);
      if (ti >= 0) {
        nextTray = tray.filter((_, i) => i !== ti);
      }
      update({ slots: nextSlots, tray: nextTray, moves: moves + 1 });
    },
    [puzzle, slots, tray, moves, update]
  );

  /** clear all slots of a cell back to tray */
  const pickupCell = useCallback(
    (r: number, c: number) => {
      const cell = puzzle.grid[r]?.[c];
      if (!cell) return;
      const nextSlots = { ...slots };
      const back: HanziTile[] = [];
      let touched = false;
      if (cell.split) {
        for (const side of ["l", "r"] as const) {
          const k = slotKey(r, c, side);
          const v = slots[k];
          if (v !== undefined) {
            delete nextSlots[k];
            back.push({ id: Date.now() + back.length, kind: "part", label: v });
            touched = true;
          }
        }
      } else {
        const k = slotKey(r, c);
        const v = slots[k];
        if (v !== undefined) {
          delete nextSlots[k];
          back.push({ id: Date.now(), kind: "whole", label: v });
          touched = true;
        }
      }
      if (!touched) return;
      update({ slots: nextSlots, tray: [...tray, ...back], moves: moves + 1 });
    },
    [puzzle, slots, tray, moves, update]
  );

  /** reveal a whole word */
  const revealWord = useCallback(
    (clueId: number) => {
      if (revealsLeft <= 0 || completed) return;
      const clue = puzzle.clues.find((c) => c.id === clueId);
      if (!clue || revealedIds.includes(clueId)) return;

      const nextSlots = { ...slots };
      const dr = clue.direction === "across" ? 0 : 1;
      const dc = clue.direction === "across" ? 1 : 0;
      for (let i = 0; i < clue.word.length; i++) {
        const r = clue.row + dr * i;
        const c = clue.col + dc * i;
        const cell = puzzle.grid[r][c];
        if (!cell) continue;
        if (cell.split) {
          if (nextSlots[slotKey(r, c, "l")] !== cell.split.l) nextSlots[slotKey(r, c, "l")] = cell.split.l;
          if (nextSlots[slotKey(r, c, "r")] !== cell.split.r) nextSlots[slotKey(r, c, "r")] = cell.split.r;
        } else {
          if (nextSlots[slotKey(r, c)] !== cell.char) nextSlots[slotKey(r, c)] = cell.char;
        }
      }
      const nextRevealed = [...revealedIds, clueId];
      update({ slots: nextSlots, revealedIds: nextRevealed, moves: moves + 1, revealsLeft: revealsLeft - 1 });
    },
    [revealsLeft, completed, puzzle, revealedIds, slots, moves, update]
  );

  /** shuffle tray order */
  const shuffleTray = useCallback(() => {
    setTray((prev) => {
      const a = [...prev];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSlots({});
    setTray(initialTray(puzzle));
    setRevealedIds([]);
    setRevealsLeft(REVEALS);
    setMoves(0);
    setSeconds(0);
    setElapsed(0);
    setCompleted(false);
    setSelected(null);
    setDismissed(false);
    const all = loadSaved();
    delete all[date];
    saveSaved(all);
  }, [puzzle, date]);

  const isToday = date === todayStr();
  const prevDate = addDays(date, -1);
  const nextDate = addDays(date, 1);
  const totalSlots = allTargets.length;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-teal-100 text-stone-800 dark:from-stone-900 dark:to-stone-950 dark:text-stone-100">
      {/* top bar */}
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-sm text-white shadow">
            字
          </span>
          <span className="text-lg">字缠</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/puzzles"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
            title="历史题库"
          >
            📚
          </Link>
          <Link
            href="/notebook"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
            title="生字本"
          >
            📖
          </Link>
          <button
            onClick={() => setSettings((s) => ({ ...s, pinyin: !s.pinyin }))}
            className={`grid h-9 place-items-center rounded-full px-2 text-xs font-bold transition ${
              settings.pinyin
                ? "bg-teal-500 text-white"
                : "bg-white/70 text-stone-400 hover:bg-white dark:bg-white/10"
            }`}
            title="拼音模式"
          >
            拼
          </button>
          <div className="rounded-full bg-white/70 px-3 py-1 font-semibold dark:bg-white/10" title="连续打卡">
            🔥 {streak.current}
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 font-mono tabular-nums dark:bg-white/10" title="用时">
            ⏱ {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, dark: !s.dark }))}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/70 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
            title="深色模式"
          >
            {settings.dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-8 lg:flex-row lg:items-start">
        {/* left: board */}
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-center gap-3 text-center">
            <Link
              href={`/?date=${prevDate}`}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-stone-600 shadow-sm hover:bg-white dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/20"
              title="前一天的题"
            >
              ‹
            </Link>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                {new Date(date + "T00:00:00").toLocaleDateString("zh-CN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {isToday && (
                  <span className="ml-2 rounded-full bg-teal-500 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">
                    今日
                  </span>
                )}
              </h1>
              <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
                主题：{puzzle.theme}
              </p>
            </div>
            {!isToday && (
              <Link
                href={`/?date=${nextDate}`}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-stone-600 shadow-sm hover:bg-white dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/20"
                title="后一天的题"
              >
                ›
              </Link>
            )}
            {isToday && <div className="h-8 w-8" />}
          </div>

          <GameBoard
            puzzle={puzzle}
            slots={slots}
            revealedIds={revealedIds}
            activeClue={activeClue}
            wrongCell={wrongCell}
            selectedTile={selectedTile}
            showPinyin={settings.pinyin}
            onCellClick={(r, c) => {
              if (selectedTile) {
                placeTile(selectedTile, r, c);
              } else {
                pickupCell(r, c);
              }
            }}
          />

          <TileTray
            tiles={tray}
            selectedId={selected}
            onSelect={(id) => setSelected((s) => (s === id ? null : id))}
            onShuffle={shuffleTray}
            onReset={handleReset}
            onDrop={(tileId, r, c) => {
              const t = tray.find((x) => x.id === tileId);
              if (t) placeTile(t, r, c);
            }}
          />

          {/* progress */}
          <div className="mt-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
            已拼 {solvedCount}/{totalSlots} 个部件 · 剩余揭示 {revealsLeft} 次
          </div>
        </div>

        {/* right: clues */}
        <CluePanel
          puzzle={puzzle}
          slots={slots}
          revealedIds={revealedIds}
          activeClue={activeClue}
          revealsLeft={revealsLeft}
          onSelectClue={(id) => setActiveClue((a) => (a === id ? null : id))}
          onReveal={revealWord}
        />
      </main>

      {completed && !dismissed && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="pointer-events-auto mx-4 w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-stone-800">
            <div className="text-5xl">🎉</div>
            <h2 className="mt-2 text-2xl font-extrabold">拼字完成！</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {puzzle.theme} · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} · {moves} 步
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 font-bold text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">
              🔥 连续 {streak.current} 天
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => {
                  setDismissed(true);
                  setShowShare(true);
                }}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-bold text-white shadow hover:opacity-90"
              >
                分享成绩单
              </button>
              <button
                onClick={() => {
                  setDismissed(true);
                  setShowWordCard(true);
                }}
                className="rounded-xl bg-white py-2.5 font-semibold text-teal-600 ring-2 ring-teal-200 hover:bg-teal-50 dark:bg-stone-700 dark:text-teal-300 dark:ring-teal-500/40 dark:hover:bg-stone-600"
              >
                📖 看看今日字卡
              </button>
              <Link
                href={`/?date=${prevDate}`}
                className="rounded-xl bg-stone-100 py-2.5 text-center font-semibold text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300"
              >
                再拼一题
              </Link>
              <button
                onClick={() => setDismissed(true)}
                className="rounded-xl bg-stone-100 py-2.5 font-semibold text-stone-600 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300"
              >
                继续看看
              </button>
            </div>
          </div>
        </div>
      )}

      {showWordCard && (
        <WordCardModal puzzle={puzzle} onClose={() => setShowWordCard(false)} />
      )}

      {showShare && (
        <ShareModal
          puzzle={puzzle}
          slots={slots}
          seconds={elapsed}
          moves={moves}
          streak={streak.current}
          onClose={() => setShowShare(false)}
        />
      )}

      <TutorialModal />
    </div>
  );
}