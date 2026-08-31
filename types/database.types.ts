export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlatformType =
  | "LeetCode"
  | "CodeChef"
  | "HackerRank"
  | "GeeksforGeeks"
  | "Other";

export type DifficultyType = "Easy" | "Medium" | "Hard";

export type ProblemStatusType = "Unsolved" | "Attempted" | "Solved";

export interface Database {
  public: {
    Tables: {
      problems: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          platform: PlatformType;
          problem_url: string | null;
          difficulty: DifficultyType;
          topic: string;
          pattern: string | null;
          status: ProblemStatusType;
          description: string | null;
          approach: string | null;
          brute_force: string | null;
          optimal_approach: string | null;
          time_complexity: string | null;
          space_complexity: string | null;
          mistakes: string | null;
          notes: string | null;
          date_added: string;
          date_solved: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          platform?: PlatformType;
          problem_url?: string | null;
          difficulty: DifficultyType;
          topic: string;
          pattern?: string | null;
          status?: ProblemStatusType;
          description?: string | null;
          approach?: string | null;
          brute_force?: string | null;
          optimal_approach?: string | null;
          time_complexity?: string | null;
          space_complexity?: string | null;
          mistakes?: string | null;
          notes?: string | null;
          date_added?: string;
          date_solved?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          platform?: PlatformType;
          problem_url?: string | null;
          difficulty?: DifficultyType;
          topic?: string;
          pattern?: string | null;
          status?: ProblemStatusType;
          description?: string | null;
          approach?: string | null;
          brute_force?: string | null;
          optimal_approach?: string | null;
          time_complexity?: string | null;
          space_complexity?: string | null;
          mistakes?: string | null;
          notes?: string | null;
          date_added?: string;
          date_solved?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "problems_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          provider: string | null;
          daily_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          provider?: string | null;
          daily_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          provider?: string | null;
          daily_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          problems_solved: number;
          regular_problems_solved: number;
          daily_challenge_solved: number;
          daily_goal: number;
          goal_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date: string;
          problems_solved?: number;
          regular_problems_solved?: number;
          daily_challenge_solved?: number;
          daily_goal?: number;
          goal_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_date?: string;
          problems_solved?: number;
          regular_problems_solved?: number;
          daily_challenge_solved?: number;
          daily_goal?: number;
          goal_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_activity_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_date: string;
          problem_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_date: string;
          problem_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_date?: string;
          problem_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_challenges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_challenges_problem_id_fkey";
            columns: ["problem_id"];
            isOneToOne: false;
            referencedRelation: "problems";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Problem = Database["public"]["Tables"]["problems"]["Row"];
export type ProblemInsert = Database["public"]["Tables"]["problems"]["Insert"];
export type ProblemUpdate = Database["public"]["Tables"]["problems"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type DailyActivity = Database["public"]["Tables"]["daily_activity"]["Row"];
export type DailyActivityInsert = Database["public"]["Tables"]["daily_activity"]["Insert"];
export type DailyActivityUpdate = Database["public"]["Tables"]["daily_activity"]["Update"];

export type DailyChallenge = Database["public"]["Tables"]["daily_challenges"]["Row"];
export type DailyChallengeInsert = Database["public"]["Tables"]["daily_challenges"]["Insert"];
export type DailyChallengeUpdate = Database["public"]["Tables"]["daily_challenges"]["Update"];
