import { z } from "zod";

export const problemSchema = z.object({
  title: z.string().trim().min(1, "Problem title is required").max(255, "Title too long"),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Difficulty is required",
  }),
  topic: z.string().trim().min(1, "Topic is required").max(100, "Topic too long"),
  platform: z.enum(["LeetCode", "CodeChef", "HackerRank", "GeeksforGeeks", "Other"]).default("LeetCode"),
  problem_url: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val === "" || /^(https?:\/\/)/i.test(val),
      "Must be a valid URL starting with http:// or https://"
    ),
  pattern: z.string().trim().max(100).optional(),
  status: z.enum(["Unsolved", "Attempted", "Solved"]).default("Unsolved"),
  description: z.string().trim().optional(),
  approach: z.string().trim().optional(),
  brute_force: z.string().trim().optional(),
  optimal_approach: z.string().trim().optional(),
  time_complexity: z.string().trim().max(100).optional(),
  space_complexity: z.string().trim().max(100).optional(),
  mistakes: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type ProblemFormInput = z.infer<typeof problemSchema>;
