import { WORD_BANK } from "../lib/hanzi/words";
import { CHAR_SPLITS, WHOLE_CHAR_SET } from "../lib/hanzi/characters";

let bad = 0;
for (const w of WORD_BANK) {
  for (const ch of w.word) {
    if (!CHAR_SPLITS[ch] && !WHOLE_CHAR_SET.has(ch)) {
      console.log(`缺少: "${ch}" (来自 "${w.word}")`);
      bad++;
    }
  }
}
console.log(`词数: ${WORD_BANK.length}, 缺字: ${bad}, 合体字: ${Object.keys(CHAR_SPLITS).length}, 整字: ${WHOLE_CHAR_SET.size}`);
