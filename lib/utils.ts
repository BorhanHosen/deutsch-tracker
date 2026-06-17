import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Level thresholds — cumulative XP required
export const LEVEL_THRESHOLDS: Record<string, { min: number; max: number }> = {
  A1: { min: 0, max: 500 },
  A2: { min: 500, max: 1500 },
  B1: { min: 1500, max: 3000 },
  B2: { min: 3000, max: 5000 },
  C1: { min: 5000, max: 8000 },
  C2: { min: 8000, max: 12000 },
};

// Returns current level based on total XP
export function getLevelFromXP(xp: number): string {
  if (xp >= 8000) return "C2";
  if (xp >= 5000) return "C1";
  if (xp >= 3000) return "B2";
  if (xp >= 1500) return "B1";
  if (xp >= 500) return "A2";
  return "A1";
}

// Returns progress WITHIN current level
// e.g. xp=700 → level A2 (500-1500)
//   → progress = (700-500)/(1500-500) = 20%
//   → xpInLevel = 200
//   → xpForLevel = 1000
export function getXPProgress(xp: number): {
  level: string;
  xpInLevel: number;
  xpForLevel: number;
  percent: number;
  totalXP: number;
  nextLevel: string | null;
  xpToNext: number;
} {
  const level = getLevelFromXP(xp);
  const threshold = LEVEL_THRESHOLDS[level];

  // Already at max level
  if (level === "C2") {
    return {
      level,
      xpInLevel: xp - threshold.min,
      xpForLevel: threshold.max - threshold.min,
      percent: Math.min(
        ((xp - threshold.min) / (threshold.max - threshold.min)) * 100,
        100,
      ),
      totalXP: xp,
      nextLevel: null,
      xpToNext: 0,
    };
  }

  const xpInLevel = xp - threshold.min;
  const xpForLevel = threshold.max - threshold.min;
  const percent = Math.min((xpInLevel / xpForLevel) * 100, 100);

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const currentIndex = levels.indexOf(level);
  const nextLevel =
    currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

  const xpToNext = threshold.max - xp;

  return {
    level,
    xpInLevel,
    xpForLevel,
    percent,
    totalXP: xp,
    nextLevel,
    xpToNext: Math.max(0, xpToNext),
  };
}

export function getXPForNextLevel(level: string): number {
  const map: Record<string, number> = {
    A1: 500,
    A2: 1500,
    B1: 3000,
    B2: 5000,
    C1: 8000,
    C2: 10000,
  };
  return map[level] ?? 500;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return formatDate(date);
}

export function updateStreak(
  lastActiveDate: Date | null,
  currentStreak: number,
): { streak: number; changed: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastActiveDate) {
    return { streak: 1, changed: true };
  }

  const last = new Date(lastActiveDate);
  last.setHours(0, 0, 0, 0);

  const diff = Math.floor((today.getTime() - last.getTime()) / 86400000);

  if (diff === 0) {
    return { streak: currentStreak, changed: false };
  }
  if (diff === 1) {
    return { streak: currentStreak + 1, changed: true };
  }
  return { streak: 1, changed: true };
}
