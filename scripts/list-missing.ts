import { WORD_BANK } from "../lib/hanzi/words";
import { CHAR_SPLITS, WHOLE_CHAR_SET } from "../lib/hanzi/characters";
const missing = new Set<string>();
const inWords = new Map<string, string[]>();
for (const w of WORD_BANK) {
  for (const ch of w.word) {
    if (!CHAR_SPLITS[ch] && !WHOLE_CHAR_SET.has(ch)) {
      missing.add(ch);
      if (!inWords.has(ch)) inWords.set(ch, []);
      inWords.get(ch)!.push(w.word);
    }
  }
}
for (const ch of [...missing].sort()) console.log(`${ch}: 出现在 ${inWords.get(ch)!.join("、")}`);
