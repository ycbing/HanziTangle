import { WORD_BANK } from "../lib/hanzi/words";
import { CHAR_SPLITS, CHAR_SPLITS_TB, WHOLE_CHAR_SET, getSplit } from "../lib/hanzi/characters";

let bad = 0;
for (const w of WORD_BANK) {
  for (const ch of w.word) {
    if (!getSplit(ch) && !WHOLE_CHAR_SET.has(ch)) {
      console.log(`缺少: "${ch}" (来自 "${w.word}")`);
      bad++;
    }
  }
}
console.log(
  `词数: ${WORD_BANK.length}, 缺字: ${bad}, 左右合体: ${Object.keys(CHAR_SPLITS).length}, 上下合体: ${Object.keys(CHAR_SPLITS_TB).length}, 整字: ${WHOLE_CHAR_SET.size}`
);
