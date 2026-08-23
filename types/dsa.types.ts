import { Problem, DifficultyType, ProblemStatusType, PlatformType } from "./database.types";

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
