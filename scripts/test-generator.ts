import { generatePuzzle } from "../lib/hanzi/generator";
import { targetSlots } from "../lib/hanzi/types";

let totalPoor = 0;
for (let back = 30; back >= 0; back--) {
  const d = new Date("2026-10-21T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - back);
  const date = d.toISOString().slice(0, 10);
  const p = generatePuzzle(date);
  const cells = p.grid.flat().filter(Boolean).length;
  const slots = targetSlots(p);
  const p2 = generatePuzzle(date);
  const same = JSON.stringify(p.grid) === JSON.stringify(p2.grid);
  // swap-check: count words, crossings
  const crosses = p.clues.reduce((n, cl) => {
    const dr = cl.direction === "across" ? 0 : 1;
    const dc = cl.direction === "across" ? 1 : 0;
    let x = 0;
    for (let k = 0; k < cl.word.length; k++) {
      if (p.grid[cl.row + dr * k][cl.col + dc * k]!.wordIds.length > 1) x++;
    }
    return n + x;
  }, 0);
  const labels = new Set(p.tiles.map(t => t.label));
  const badSlot = slots.some(s => !labels.has(s.label));
  const poor = p.clues.length < 5;
  if (poor) totalPoor++;
  console.log(`${date}: ${p.theme} ${p.clues.length}词 ${cells}格 ${slots.length}槽 ${crosses}交叉 ${p.tiles.length}砖 确定性:${same} 缺件:${badSlot}${poor ? " ⚠️" : ""}`);
}
console.log(`\n31天中词数<5的天数: ${totalPoor}`);
