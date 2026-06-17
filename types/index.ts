import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      level: string;
      xp: number;
      streak: number;
      badges: string[];
    };
  }

  interface JWT {
    dbId?: string;
    level?: string;
    xp?: number;
    streak?: number;
    badges?: string[];
  }
}

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Category =
  | "Food"
  | "Travel"
  | "Daily Life"
  | "Family"
  | "Shopping"
  | "University"
  | "Technology"
  | "Other";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type TaskType =
  | "learn_words"
  | "write_sentences"
  | "review"
  | "real_life"
  | "quiz";

export type TaskStatus = "pending" | "completed" | "overdue";

export interface IWord {
  _id: string;
  userId: string;
  german: string;
  english: string;
  bangla: string;
  pronunciation: string;
  category: Category;
  difficulty: Difficulty;
  notes: string;
  frequency: number;
  quizScore: number;
  nextReviewDate: string;
  reviewInterval: number;
  easeFactor: number;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export interface ISentence {
  _id: string;
  userId: string;
  german: string;
  english: string;
  bangla: string;
  category: string;
  difficulty: Difficulty;
  notes: string;
  wordsUsed: string[];
  createdAt: string;
}

export interface ITask {
  _id: string;
  userId: string;
  taskId: string;
  type: TaskType;
  title: string;
  description: string;
  targetCount: number;
  completedCount: number;
  status: TaskStatus;
  dueDate: string;
  completedAt: string | null;
  xpReward: number;
  createdAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  level: Level;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  badges: string[];
  weeklyGoal: number;
  monthlyGoal: number;
  createdAt: string;
}
