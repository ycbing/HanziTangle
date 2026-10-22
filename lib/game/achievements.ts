"use client";

// 成就徽章系统: 从现有存档数据派生, 无需额外埋点
import { loadStreak, loadMistakes, type StreakInfo } from "./storage";

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  /** 返回是否已解锁 */
  check: (s: StreakInfo, mistakeCount: number) => boolean;
  /** 解锁进度 (0-1), 用于进度条 */
  progress: (s: StreakInfo, mistakeCount: number) => number;
}

export const BADGES: Badge[] = [
  {
    id: "first",
    emoji: "🎯",
    name: "初出茅庐",
    desc: "完成第一道题",
    check: (s) => s.history.length >= 1,
    progress: (s) => Math.min(s.history.length / 1, 1),
  },
  {
    id: "seven",
    emoji: "📚",
    name: "勤学不辍",
    desc: "累计完成 7 道题",
    check: (s) => s.history.length >= 7,
    progress: (s) => Math.min(s.history.length / 7, 1),
  },
  {
    id: "thirty",
    emoji: "🏆",
    name: "百炼成钢",
    desc: "累计完成 30 道题",
    check: (s) => s.history.length >= 30,
    progress: (s) => Math.min(s.history.length / 30, 1),
  },
  {
    id: "streak3",
    emoji: "🔥",
    name: "三日热忱",
    desc: "连续打卡 3 天",
    check: (s) => s.best >= 3,
    progress: (s) => Math.min(s.best / 3, 1),
  },
  {
    id: "streak7",
    emoji: "⚡",
    name: "七日连胜",
    desc: "连续打卡 7 天",
    check: (s) => s.best >= 7,
    progress: (s) => Math.min(s.best / 7, 1),
  },
  {
    id: "streak30",
    emoji: "👑",
    name: "月度坚持",
    desc: "连续打卡 30 天",
    check: (s) => s.best >= 30,
    progress: (s) => Math.min(s.best / 30, 1),
  },
  {
    id: "explorer",
    emoji: "🧭",
    name: "主题探索家",
    desc: "玩过 5 个不同主题",
    check: (s) => s.themes.length >= 5,
    progress: (s) => Math.min(s.themes.length / 5, 1),
  },
  {
    id: "collector",
    emoji: "🎨",
    name: "主题收藏家",
    desc: "玩过全部 15 个主题",
    check: (s) => s.themes.length >= 15,
    progress: (s) => Math.min(s.themes.length / 15, 1),
  },
  {
    id: "mistakes5",
    emoji: "🩹",
    name: "知错能改",
    desc: "错字本积累 5 个字",
    check: (_s, m) => m >= 5,
    progress: (_s, m) => Math.min(m / 5, 1),
  },
  {
    id: "mistakes20",
    emoji: "🧠",
    name: "错中学",
    desc: "错字本积累 20 个字",
    check: (_s, m) => m >= 20,
    progress: (_s, m) => Math.min(m / 20, 1),
  },
];

export interface BadgeState {
  badge: Badge;
  unlocked: boolean;
}

export function getBadgeStates(): BadgeState[] {
  const s = loadStreak();
  const m = Object.keys(loadMistakes()).length;
  return BADGES.map((badge) => ({
    badge,
    unlocked: badge.check(s, m),
  }));
}

export function unlockedCount(): number {
  return getBadgeStates().filter((b) => b.unlocked).length;
}

/** 通关后调用, 返回本次新解锁的徽章 (用于弹提示) */
export function newlyUnlocked(prevUnlockedIds: string[]): Badge[] {
  return getBadgeStates().filter((b) => b.unlocked && !prevUnlockedIds.includes(b.badge.id)).map((b) => b.badge);
}