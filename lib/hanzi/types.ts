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
  split: { l: string; r: string } | { t: string; b: string } | null; // lr=左右, tb=上下, null=whole
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

/** slot key helpers: whole = "r,c"; lr split = "r,c,l"|"r,c,r"; tb split = "r,c,t"|"r,c,b" */
export function slotKey(r: number, c: number, side?: "l" | "r" | "t" | "b") {
  return side ? `${r},${c},${side}` : `${r},${c}`;
}

/** split 的两个槽位 key+目标（兼容 lr/tb） */
export function splitSlots(
  r: number,
  c: number,
  split: { l: string; r: string } | { t: string; b: string }
): { key: string; label: string }[] {
  if ("l" in split) {
    return [
      { key: slotKey(r, c, "l"), label: split.l },
      { key: slotKey(r, c, "r"), label: split.r },
    ];
  }
  return [
    { key: slotKey(r, c, "t"), label: split.t },
    { key: slotKey(r, c, "b"), label: split.b },
  ];
}

/** all slot keys + target labels for a puzzle */
export function targetSlots(puzzle: HanziPuzzle): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cell = puzzle.grid[r][c];
      if (!cell) continue;
      if (cell.split) {
        out.push(...splitSlots(r, c, cell.split));
      } else {
        out.push({ key: slotKey(r, c), label: cell.char });
      }
    }
  }
  return out;
}