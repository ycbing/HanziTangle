// Hanzi Tangle - 每日汉字拼字生成器 v2
// 策略: ①横向平铺 2-3 个主题词 ②纵向主题词交叉 ③全词库交叉扩展 ④兜底平铺到 6+ 词

import { CHAR_SPLITS, WHOLE_CHAR_SET } from "./characters";
import { WORD_BANK, HANZI_THEMES, charWordIndex } from "./words";
import type { HanziPuzzle, HanziTile, HanziClue, HanziCell } from "./types";

export const ROWS = 6;
export const COLS = 8;
const MAX_GUARD = 3000;

function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PlacedWord {
  word: string;
  hint: string;
  theme: string;
  row: number;
  col: number;
  dir: "across" | "down";
}

type Grid = (HanziCell | null)[][];

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<HanziCell | null>(COLS).fill(null));
}

function canPlace(
  grid: Grid,
  word: string,
  row: number,
  col: number,
  dir: "across" | "down"
): boolean {
  const dr = dir === "across" ? 0 : 1;
  const dc = dir === "across" ? 1 : 0;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    const cell = grid[r][c];
    if (cell && cell.char !== word[i]) return false;
  }
  return true;
}

function placeWord(grid: Grid, w: PlacedWord): void {
  const dr = w.dir === "across" ? 0 : 1;
  const dc = w.dir === "across" ? 1 : 0;
  for (let i = 0; i < w.word.length; i++) {
    const r = w.row + dr * i;
    const c = w.col + dc * i;
    const cell = grid[r][c];
    if (cell) {
      if (!cell.wordIds.includes(-1)) cell.wordIds.push(-1);
      continue;
    }
    const split = CHAR_SPLITS[w.word[i]] ?? null;
    grid[r][c] = { char: w.word[i], split, wordIds: [-1] };
  }
}

/** count how many grid cells this word shares with existing words (crossings) */
function crossingCount(grid: Grid, word: string, row: number, col: number, dir: "across" | "down"): number {
  const dr = dir === "across" ? 0 : 1;
  const dc = dir === "across" ? 1 : 0;
  let n = 0;
  for (let i = 0; i < word.length; i++) {
    if (grid[row + dr * i]?.[col + dc * i]) n++;
  }
  return n;
}

function tryCross(
  grid: Grid,
  placed: PlacedWord[],
  usedWords: Set<string>,
  pools: { pool: typeof WORD_BANK; themeId: string }[],
  rnd: () => number,
  maxCross: number
): boolean {
  // pick a random placed word's char as crossing point
  const anchorW = placed[Math.floor(rnd() * placed.length)];
  const di = Math.floor(rnd() * anchorW.word.length);
  const ch = anchorW.word[di];

  const candidates: string[] = [];
  for (const { pool } of pools) {
    for (const wd of (charWordIndex.get(ch) ?? [])) {
      if (!usedWords.has(wd) && wd.length >= 2 && !candidates.includes(wd)) candidates.push(wd);
    }
  }
  if (candidates.length === 0) return false;

  const cand = candidates[Math.floor(rnd() * candidates.length)];
  const info = WORD_BANK.find((w) => w.word === cand)!;
  const dir: "across" | "down" = anchorW.dir === "across" ? "down" : "across";
  const dr = dir === "across" ? 0 : 1;
  const dc = dir === "across" ? 1 : 0;
  const ci = cand.indexOf(ch);
  const row = anchorW.row + (anchorW.dir === "across" ? dr : dc) * di - dr * ci;
  const col = anchorW.col + (anchorW.dir === "across" ? dc : dr) * di - dc * ci;

  if (row < 0 || col < 0) return false;
  if (!canPlace(grid, cand, row, col, dir)) return false;
  // require at least 1 real crossing
  if (crossingCount(grid, cand, row, col, dir) < 1) return false;
  // avoid placing into a solid wall of existing cells (keep it sparse)
  if (crossingCount(grid, cand, row, col, dir) > 2 && cand.length === 2) return false;

  placed.push({ word: cand, hint: info.hint, theme: info.theme, row, col, dir });
  placeWord(grid, placed[placed.length - 1]);
  usedWords.add(cand);
  return true;
}

export function generatePuzzle(date: string, themeId?: string): HanziPuzzle {
  const rnd = seededRandom("hanzi-tangle:" + date);
  const theme =
    themeId && HANZI_THEMES.some((t) => t.id === themeId)
      ? HANZI_THEMES.find((t) => t.id === themeId)!
      : HANZI_THEMES[Math.floor(rnd() * HANZI_THEMES.length)];

  const themeWords = shuffle(
    WORD_BANK.filter((w) => w.theme === theme.id && w.word.length >= 2),
    rnd
  );
  const otherWords = shuffle(
    WORD_BANK.filter((w) => w.theme !== theme.id && w.word.length >= 2),
    rnd
  );

  const grid = emptyGrid();
  const placed: PlacedWord[] = [];
  const usedWords = new Set<string>();

  // ---- 1) 2 horizontal theme words on rows 1 and 3 ----
  const rowsForH = [1, 3];
  for (const rw of rowsForH) {
    const w = themeWords.find((w) => !usedWords.has(w.word) && w.word.length <= COLS);
    if (!w) break;
    for (const col of shuffle([...Array(COLS - w.word.length + 1).keys()], rnd)) {
      if (canPlace(grid, w.word, rw, col, "across") && crossingCount(grid, w.word, rw, col, "across") === 0) {
        placed.push({ word: w.word, hint: w.hint, theme: w.theme, row: rw, col, dir: "across" });
        placeWord(grid, placed[placed.length - 1]);
        usedWords.add(w.word);
        break;
      }
    }
  }

  // ---- 2) 1 vertical theme word crossing something ----
  const vTheme = themeWords.find((w) => !usedWords.has(w.word) && w.word.length <= ROWS);
  if (vTheme) {
    // try each char of the vertical word as crossing point against horizontal words
    outer: for (let ci = 0; ci < vTheme.word.length; ci++) {
      const ch = vTheme.word[ci];
      for (const p of placed) {
        if (p.dir !== "across") continue;
        const idx = p.word.indexOf(ch);
        if (idx < 0) continue;
        const row = p.row - ci;
        const col = p.col + idx;
        if (row < 0) continue;
        if (canPlace(grid, vTheme.word, row, col, "down") && crossingCount(grid, vTheme.word, row, col, "down") >= 1) {
          placed.push({ word: vTheme.word, hint: vTheme.hint, theme: vTheme.theme, row, col, dir: "down" });
          placeWord(grid, placed[placed.length - 1]);
          usedWords.add(vTheme.word);
          break outer;
        }
      }
    }
  }

  // ---- 3) crossing expansion from the full word bank ----
  const pools = [
    { pool: themeWords, themeId: theme.id },
    { pool: otherWords, themeId: "" },
  ];
  let guard = 0;
  while (guard < MAX_GUARD && placed.length < 10) {
    guard++;
    if (tryCross(grid, placed, usedWords, pools, rnd, 1)) {
      // success — keep going
    }
  }

  // ---- 4) fallback: pad with non-crossing words to reach 5+ entries ----
  if (placed.length < 5) {
    const spareRows = [0, 2, 4, 5];
    const fallbackPool = [...themeWords, ...otherWords];
    for (const rw of spareRows) {
      if (placed.length >= 6) break;
      const w = fallbackPool.find((w) => !usedWords.has(w.word) && w.word.length + 1 <= COLS);
      if (!w) continue;
      for (const col of shuffle([...Array(COLS - w.word.length + 1).keys()], rnd)) {
        if (canPlace(grid, w.word, rw, col, "across") && crossingCount(grid, w.word, rw, col, "across") === 0) {
          placed.push({ word: w.word, hint: w.hint, theme: w.theme, row: rw, col, dir: "across" });
          placeWord(grid, placed[placed.length - 1]);
          usedWords.add(w.word);
          break;
        }
      }
    }
  }

  // ---- 5) clue numbers + clue list ----
  const numByCell = new Map<string, number>();
  const clues: HanziClue[] = [];
  let numCounter = 1;
  const sortedPlaced = [...placed].sort((a, b) => a.row - b.row || a.col - b.col);
  for (const p of sortedPlaced) {
    const key = `${p.row},${p.col}`;
    if (!numByCell.has(key)) {
      numByCell.set(key, numCounter);
      numCounter++;
    }
    const id = clues.length;
    clues.push({
      id,
      direction: p.dir,
      word: p.word,
      hint: p.hint,
      number: numByCell.get(key)!,
      row: p.row,
      col: p.col,
    });
  }

  // ---- 6) attach wordIds to grid cells ----
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      const num = numByCell.get(`${r},${c}`);
      if (num !== undefined) cell.number = num;
      const ids: number[] = [];
      clues.forEach((cl, i) => {
        const dr = cl.direction === "across" ? 0 : 1;
        const dc = cl.direction === "across" ? 1 : 0;
        for (let k = 0; k < cl.word.length; k++) {
          if (cl.row + dr * k === r && cl.col + dc * k === c) {
            ids.push(i);
            break;
          }
        }
      });
      cell.wordIds = ids.length > 0 ? ids : cell.wordIds;
    }
  }

  // ---- 7) tiles ----
  const tiles: HanziTile[] = [];
  let tid = 0;
  for (const p of placed) {
    for (const ch of p.word) {
      const split = CHAR_SPLITS[ch];
      if (split) {
        tiles.push({ id: tid++, kind: "part", label: split.l });
        tiles.push({ id: tid++, kind: "part", label: split.r });
      } else if (WHOLE_CHAR_SET.has(ch)) {
        tiles.push({ id: tid++, kind: "whole", label: ch });
      } else {
        throw new Error(`字 "${ch}" 无法生成: 无拆分且非整字`);
      }
    }
  }
  const shuffled = shuffle(tiles, rnd);

  return {
    date,
    theme: theme.name,
    rows: ROWS,
    cols: COLS,
    grid,
    clues,
    tiles: shuffled,
  };
}