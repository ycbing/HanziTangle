<div align="center">

# 🧩 字缠 Hanzi Tangle

**每日汉字拼字游戏 — 拆偏旁，拼汉字，填词阵**

把打乱的偏旁砖块拖回词语矩阵，组出今天的成语与词语。不旋转、不转置——汉字零件拆装，才是中文的玩法。

[**▶ 立即开玩**](https://craftmind.cn/hanzi/) · [历史题库](https://craftmind.cn/hanzi/puzzles/)

![Next.js](https://img.shields.io/badge/Next.js%2016-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind%20v4-38bdf8?logo=tailwindcss) ![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## ✨ 这是什么？

每天一张全新的**汉字词语矩阵**，所有汉字都被拆成了偏旁砖块混在砖盘里。你的任务：

1. 把偏旁砖块拖/点到正确的**槽位**上
2. 两个槽位齐成字 → 自动变为绿色并拼回原字
3. 所有字归位，词语矩阵亮起 — 今日通关

填完后可以生成一张**汉字分享卡**，把你的组字成绩秀到朋友圈。

## 🎮 怎么玩

| 操作 | 说明 |
|---|---|
| **选砖块** | 点它高亮，所有可放槽位会亮起提示 |
| **放砖块** | 点亮的槽位，或者直接**拖**过去 |
| **换位置** | 再点一次已放置的砖块，它弹回砖盘 |
| **被卡住** | 💡 揭示 ×3：自动帮你拼好一个字 |
| **重来** | 🔀 洗牌打乱砖盘 · ↺ 重开今日题 |

**核心机制**：交叉格共享整字（部件零冲突），形声字拆偏旁、独体字用整字砖块混排——这是汉字独有的拼字玩法。

## 🌟 特性

- **每日汉字题** — 189 词 / 15 主题（城市、自然、情感、食物、动物…），含四字词如「江河湖海」
- **一年题库** — 365 天历史题全部可重玩，[日历归档](https://craftmind.cn/hanzi/puzzles/)，确定性生成，回放与当日一模一样
- **连击与统计** — 每日 streak、计时、组字计数
- **汉字分享卡** — canvas 生成 840×1240 大字分享图（下载 / 复制 / 系统分享）
- **免注册** — 进度与连击存在 `localStorage`
- **移动端优先** — pointer events，鼠标和触屏都能拖

## 🧱 技术栈

- **Next.js 16**（App Router，`basePath` 部署于 `/hanzi`）
- **TypeScript** · **Tailwind CSS v4**
- **无数据库** — 状态全在客户端（`localStorage`），谜题由日期确定性推导
- **生成器零运行时依赖** — 自带汉字拆分库与词库

## 🚀 本地运行

```bash
git clone git@github.com:ycbing/HanziTangle.git
cd HanziTangle
npm install
npm run dev     # http://localhost:3000
```

生产构建：

```bash
npm run build
npm start       # 默认 :3000（可用 PORT=3012 覆盖）
```

> 子路径部署？在 `next.config.ts` 设置 `basePath`（线上部署为 `/hanzi`）。

## 📁 项目结构

```
app/
  page.tsx              # 每日谜题（支持 ?date=YYYY-MM-DD）
  puzzles/page.tsx      # 历史题库日历（365 天）
components/hanzi/
  HanziGame.tsx         # 游戏状态机（矩阵/砖盘/连击/存档）
  GameBoard.tsx         # 网格渲染、槽位提示、错误反馈
  TileTray.tsx          # 拖拽砖盘（pointer events）
  ShareModal.tsx        # 汉字分享卡生成器
lib/hanzi/
  characters.ts         # 259 合体字拆分表 + 150 整字 + 变体映射（水→氵 手→扌 …）
  words.ts              # 189 词 / 15 主题词库
  generator.ts          # 确定性字阵生成器（平铺主题词 + 交叉扩展）
  types.ts              # Puzzle / Cell / Tile 类型
lib/game/storage.ts     # localStorage 持久化 + 连击逻辑
scripts/
  verify.ts             # 词库完整性校验（0 缺失）
```

## 🧠 生成器原理

谜题**完全确定**——同一日期永远生成同一张矩阵，因此全年归档可免费重玩：

1. `seededRandom(date)` 从日期字符串推导随机数
2. 选定主题（或 `?theme=` 强制指定）
3. 平铺主题词：主题词横向铺入矩阵，交叉扩展补词
4. 交叉格共享整字，**部件零冲突**——生成器比英文版更简单也更稳
5. 合体字按拆分表拆成偏旁砖块，独体字以整字砖块混排

## 🗺 路线图

- [ ] 上下结构字（部件槽）、主题日历强化
- [ ] 镜像机关彩蛋（人↔入）、难度分级
- [ ] UGC 自定义题目 + 微信分享深优化
- [ ] 更多主题（诗词、成语接龙…）

## 📄 License

[MIT](LICENSE)