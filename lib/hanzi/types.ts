// Hanzi Tangle - puzzle types

export type Direction = "across" | "down";

export interface HanziClue {
  id: number;
  direction: Direction;
  word: string; // the answer word
  hint: string; // the clue text
  number: number;
  row: number;
  col: number;
}

export interface HanziCell {
  char: string; // the target character
  split: { l: string; r: string } | null; // null = whole char (no split)
  wordIds: number[];
  number?: number;
}

export type TileKind = "part" | "whole";

export interface HanziTile {
  id: number;
  kind: TileKind;
  label: string; // part label (氵/木/青) or whole char (水/山)
}

export interface HanziPuzzle {
  date: string; // YYYY-MM-DD
  theme: string;
  rows: number;
  cols: number;
  grid: (HanziCell | null)[][];
  clues: HanziClue[];
  tiles: HanziTile[]; // shuffled
}

/** slot key helpers: whole char = "r,c"; split = "r,c,l" | "r,c,r" */
export function slotKey(r: number, c: number, side?: "l" | "r") {
  return side ? `${r},${c},${side}` : `${r},${c}`;
}

/** all slot keys + target labels for a puzzle */
export function targetSlots(puzzle: HanziPuzzle): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cell = puzzle.grid[r][c];
      if (!cell) continue;
      if (cell.split) {
        out.push({ key: slotKey(r, c, "l"), label: cell.split.l });
        out.push({ key: slotKey(r, c, "r"), label: cell.split.r });
      } else {
        out.push({ key: slotKey(r, c), label: cell.char });
      }
    }
  }
  return out;
}