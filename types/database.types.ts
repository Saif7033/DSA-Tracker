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
