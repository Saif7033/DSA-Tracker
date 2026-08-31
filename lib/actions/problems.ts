"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { problemSchema, ProblemFormInput } from "@/lib/validations/problem";
import { Problem, ProblemInsert, ProblemUpdate, ProblemStatusType } from "@/types/database.types";
import { ProblemFilterOptions, DashboardStats } from "@/types/dsa.types";
import { formatDateStr, syncDailyActivityForDate } from "@/lib/actions/daily-activity";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized. Please log in to continue.");
  }

  return { supabase, user };
}

export async function createProblem(
  input: ProblemFormInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const parsed = problemSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const val = parsed.data;
    const isSolved = val.status === "Solved";
    const nowIso = new Date().toISOString();

    const insertPayload: ProblemInsert = {
      user_id: user.id,
      title: val.title,
      platform: val.platform,
      problem_url: val.problem_url || null,
      difficulty: val.difficulty,
      topic: val.topic,
      pattern: val.pattern || null,
      status: val.status,
      description: val.description || null,
      approach: val.approach || null,
      brute_force: val.brute_force || null,
      optimal_approach: val.optimal_approach || null,
      time_complexity: val.time_complexity || null,
      space_complexity: val.space_complexity || null,
      mistakes: val.mistakes || null,
      notes: val.notes || null,
      date_solved: isSolved ? nowIso : null,
    };

    const { data, error } = await supabase
      .from("problems")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error creating problem:", error);
      return { success: false, error: error?.message || "Failed to insert problem" };
    }

    if (isSolved) {
      const todayStr = await formatDateStr(new Date());
      await syncDailyActivityForDate(user.id, todayStr);
    }

    revalidatePath("/dashboard");
    revalidatePath("/problems");

    return { success: true, id: data.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function updateProblem(
  id: string,
  input: ProblemFormInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const parsed = problemSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const val = parsed.data;

    // Fetch current problem to inspect existing date_solved
    const { data: currentProblem } = await supabase
      .from("problems")
      .select("status, date_solved")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const oldDateSolved = currentProblem?.date_solved;
    let date_solved: string | null = oldDateSolved || null;

    if (val.status === "Solved" && !date_solved) {
      date_solved = new Date().toISOString();
    } else if (val.status !== "Solved") {
      date_solved = null;
    }

    const updatePayload: ProblemUpdate = {
      title: val.title,
      platform: val.platform,
      problem_url: val.problem_url || null,
      difficulty: val.difficulty,
      topic: val.topic,
      pattern: val.pattern || null,
      status: val.status,
      description: val.description || null,
      approach: val.approach || null,
      brute_force: val.brute_force || null,
      optimal_approach: val.optimal_approach || null,
      time_complexity: val.time_complexity || null,
      space_complexity: val.space_complexity || null,
      mistakes: val.mistakes || null,
      notes: val.notes || null,
      date_solved,
    };

    const { error } = await supabase
      .from("problems")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating problem:", error);
      return { success: false, error: error.message };
    }

    // Sync affected activity dates idempotently
    if (oldDateSolved) {
      await syncDailyActivityForDate(user.id, oldDateSolved.split("T")[0]);
    }
    if (date_solved) {
      await syncDailyActivityForDate(user.id, date_solved.split("T")[0]);
    }

    revalidatePath("/dashboard");
    revalidatePath("/problems");
    revalidatePath(`/problems/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function updateProblemStatus(
  id: string,
  newStatus: ProblemStatusType
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Fetch previous problem date_solved
    const { data: currentProblem } = await supabase
      .from("problems")
      .select("date_solved")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const oldDateSolved = currentProblem?.date_solved;
    const date_solved = newStatus === "Solved" ? new Date().toISOString() : null;

    const updatePayload: ProblemUpdate = {
      status: newStatus,
      date_solved,
    };

    const { error } = await supabase
      .from("problems")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating status:", error);
      return { success: false, error: error.message };
    }

    // Sync affected daily activity dates
    if (oldDateSolved) {
      await syncDailyActivityForDate(user.id, oldDateSolved.split("T")[0]);
    }
    if (date_solved) {
      await syncDailyActivityForDate(user.id, date_solved.split("T")[0]);
    }

    revalidatePath("/dashboard");
    revalidatePath("/problems");
    revalidatePath(`/problems/${id}`);

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function deleteProblem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Check if was solved to sync activity
    const { data: currentProblem } = await supabase
      .from("problems")
      .select("date_solved")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const oldDateSolved = currentProblem?.date_solved;

    const { error } = await supabase
      .from("problems")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting problem:", error);
      return { success: false, error: error.message };
    }

    if (oldDateSolved) {
      await syncDailyActivityForDate(user.id, oldDateSolved.split("T")[0]);
    }

    revalidatePath("/dashboard");
    revalidatePath("/problems");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getProblemById(id: string): Promise<Problem | null> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getProblems(filters?: ProblemFilterOptions): Promise<Problem[]> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    let query = supabase.from("problems").select("*").eq("user_id", user.id);

    if (filters?.difficulty && filters.difficulty !== "All") {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (filters?.status && filters.status !== "All") {
      query = query.eq("status", filters.status);
    }
    if (filters?.topic && filters.topic !== "All") {
      query = query.eq("topic", filters.topic);
    }
    if (filters?.platform && filters.platform !== "All") {
      query = query.eq("platform", filters.platform);
    }

    if (filters?.sortBy === "date_added_asc") {
      query = query.order("date_added", { ascending: true });
    } else if (filters?.sortBy === "title_asc") {
      query = query.order("title", { ascending: true });
    } else if (filters?.sortBy === "difficulty_asc") {
      query = query.order("difficulty", { ascending: true });
    } else if (filters?.sortBy === "status_asc") {
      query = query.order("status", { ascending: true });
    } else {
      query = query.order("date_added", { ascending: false });
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error("Error fetching problems:", error);
      return [];
    }

    let problems: Problem[] = data;

    // Fuzzy title / pattern / topic search filtering
    if (filters?.search && filters.search.trim() !== "") {
      const term = filters.search.toLowerCase().trim();
      problems = problems.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.topic.toLowerCase().includes(term) ||
          (p.pattern && p.pattern.toLowerCase().includes(term)) ||
          p.platform.toLowerCase().includes(term)
      );
    }

    return problems;
  } catch (err) {
    console.error("Error in getProblems:", err);
    return [];
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const emptyStats: DashboardStats = {
    total: 0,
    solved: 0,
    attempted: 0,
    unsolved: 0,
    completionPercentage: 0,
    byDifficulty: {
      Easy: { total: 0, solved: 0, attempted: 0, unsolved: 0 },
      Medium: { total: 0, solved: 0, attempted: 0, unsolved: 0 },
      Hard: { total: 0, solved: 0, attempted: 0, unsolved: 0 },
    },
    byTopic: [],
    recentSolved: [],
    recentActivity: [],
  };

  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return emptyStats;
    }

    const problems: Problem[] = data;
    const total = problems.length;
    const solved = problems.filter((p) => p.status === "Solved").length;
    const attempted = problems.filter((p) => p.status === "Attempted").length;
    const unsolved = problems.filter((p) => p.status === "Unsolved").length;
    const completionPercentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    const byDifficulty = {
      Easy: {
        total: problems.filter((p) => p.difficulty === "Easy").length,
        solved: problems.filter((p) => p.difficulty === "Easy" && p.status === "Solved").length,
        attempted: problems.filter((p) => p.difficulty === "Easy" && p.status === "Attempted").length,
        unsolved: problems.filter((p) => p.difficulty === "Easy" && p.status === "Unsolved").length,
      },
      Medium: {
        total: problems.filter((p) => p.difficulty === "Medium").length,
        solved: problems.filter((p) => p.difficulty === "Medium" && p.status === "Solved").length,
        attempted: problems.filter((p) => p.difficulty === "Medium" && p.status === "Attempted").length,
        unsolved: problems.filter((p) => p.difficulty === "Medium" && p.status === "Unsolved").length,
      },
      Hard: {
        total: problems.filter((p) => p.difficulty === "Hard").length,
        solved: problems.filter((p) => p.difficulty === "Hard" && p.status === "Solved").length,
        attempted: problems.filter((p) => p.difficulty === "Hard" && p.status === "Attempted").length,
        unsolved: problems.filter((p) => p.difficulty === "Hard" && p.status === "Unsolved").length,
      },
    };

    const topicMap: Record<string, { total: number; solved: number }> = {};
    for (const p of problems) {
      if (!topicMap[p.topic]) {
        topicMap[p.topic] = { total: 0, solved: 0 };
      }
      topicMap[p.topic].total += 1;
      if (p.status === "Solved") {
        topicMap[p.topic].solved += 1;
      }
    }

    const byTopic = Object.entries(topicMap)
      .map(([topic, counts]) => ({
        topic,
        total: counts.total,
        solved: counts.solved,
        percentage: counts.total > 0 ? Math.round((counts.solved / counts.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const recentSolved = problems
      .filter((p) => p.status === "Solved" && p.date_solved)
      .sort((a, b) => new Date(b.date_solved!).getTime() - new Date(a.date_solved!).getTime())
      .slice(0, 5);

    const recentActivity = problems.slice(0, 6);

    return {
      total,
      solved,
      attempted,
      unsolved,
      completionPercentage,
      byDifficulty,
      byTopic,
      recentSolved,
      recentActivity,
    };
  } catch (err) {
    console.error("Error in getDashboardStats:", err);
    return emptyStats;
  }
}
