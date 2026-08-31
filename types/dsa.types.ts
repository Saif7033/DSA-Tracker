import { Problem, DifficultyType, ProblemStatusType, PlatformType, Profile, DailyChallenge } from "./database.types";

export interface ProblemFilterOptions {
  search?: string;
  difficulty?: DifficultyType | "All";
  status?: ProblemStatusType | "All";
  topic?: string | "All";
  platform?: PlatformType | "All";
  sortBy?: "date_added_desc" | "date_added_asc" | "title_asc" | "difficulty_asc" | "status_asc";
}

export interface DashboardStats {
  total: number;
  solved: number;
  attempted: number;
  unsolved: number;
  completionPercentage: number;
  byDifficulty: {
    Easy: { total: number; solved: number; attempted: number; unsolved: number };
    Medium: { total: number; solved: number; attempted: number; unsolved: number };
    Hard: { total: number; solved: number; attempted: number; unsolved: number };
  };
  byTopic: {
    topic: string;
    total: number;
    solved: number;
    percentage: number;
  }[];
  recentSolved: Problem[];
  recentActivity: Problem[];
}

export interface DailyChallengeWithProblem extends DailyChallenge {
  problem: Problem;
  daysSinceLastSolved: number;
}

export interface PracticeStreakInfo {
  currentStreak: number;
  longestStreak: number;
  todaySolved: number;
  dailyGoal: number;
  goalCompletedToday: boolean;
}

export interface DailyChallengeStreakInfo {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

export interface HeatmapDayData {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat (or 1=Mon, 7=Sun)
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  totalSolved: number;
  regularSolved: number;
  challengeSolved: number;
  problems: {
    id: string;
    title: string;
    difficulty: DifficultyType;
    topic: string;
    platform: PlatformType;
    isChallenge: boolean;
  }[];
}

export interface HeatmapMonthData {
  year: number;
  month: number; // 0-11
  monthName: string;
  weeks: HeatmapDayData[][];
  totalSolvedInMonth: number;
}

export interface QuickStatsSummary {
  solvedThisWeek: number;
  solvedThisMonth: number;
  totalSolved: number;
}
