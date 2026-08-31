"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Problem, DailyChallenge } from "@/types/database.types";
import { DailyChallengeWithProblem, DailyChallengeStreakInfo } from "@/types/dsa.types";
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

/**
 * Retrieves today's persistent Daily Challenge for the current user.
 * If no challenge has been selected for today yet, selects one intelligently from
 * previously solved problems and saves it to daily_challenges table.
 */
export async function getTodayDailyChallenge(): Promise<DailyChallengeWithProblem | null> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const today = await formatDateStr(new Date());

    // 1. Check if a challenge is already persisted for today
    const { data: existingChallenge } = await supabase
      .from("daily_challenges")
      .select("*, problems(*)")
      .eq("user_id", user.id)
      .eq("challenge_date", today)
      .maybeSingle();

    if (existingChallenge && existingChallenge.problems) {
      const prob = (Array.isArray(existingChallenge.problems)
        ? existingChallenge.problems[0]
        : existingChallenge.problems) as Problem;

      const dateSolved = prob.date_solved ? new Date(prob.date_solved).getTime() : new Date(prob.date_added).getTime();
      const daysSinceLastSolved = Math.max(0, Math.floor((Date.now() - dateSolved) / (1000 * 60 * 60 * 24)));

      return {
        id: existingChallenge.id,
        user_id: existingChallenge.user_id,
        challenge_date: existingChallenge.challenge_date,
        problem_id: existingChallenge.problem_id,
        completed: existingChallenge.completed,
        completed_at: existingChallenge.completed_at,
        created_at: existingChallenge.created_at,
        updated_at: existingChallenge.updated_at,
        problem: prob,
        daysSinceLastSolved,
      };
    }

    // 2. No challenge for today yet: Query all solved problems
    const { data: solvedProblems } = await supabase
      .from("problems")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "Solved");

    if (!solvedProblems || solvedProblems.length === 0) {
      return null;
    }

    // 3. Query all previous daily challenges for this user to inspect history
    const { data: history } = await supabase
      .from("daily_challenges")
      .select("problem_id, challenge_date")
      .eq("user_id", user.id)
      .order("challenge_date", { ascending: false });

    const lastChallengedMap: Record<string, string> = {};
    if (history) {
      for (const h of history) {
        if (!lastChallengedMap[h.problem_id]) {
          lastChallengedMap[h.problem_id] = h.challenge_date;
        }
      }
    }

    // 4. Candidate filtering: prefer problems not solved today if alternatives exist
    const solvedTodayList = solvedProblems.filter((p) => {
      if (!p.date_solved) return false;
      return p.date_solved.startsWith(today);
    });

    let candidates = solvedProblems;
    if (solvedTodayList.length > 0 && solvedProblems.length > solvedTodayList.length) {
      // Exclude problems solved today
      candidates = solvedProblems.filter((p) => !p.date_solved?.startsWith(today));
    }

    // 5. Score candidates
    const now = Date.now();
    const scoredCandidates = candidates.map((p) => {
      let score = 0;
      const lastChallengedDateStr = lastChallengedMap[p.id];

      if (!lastChallengedDateStr) {
        // Never challenged before -> highest priority
        score += 10000;
      } else {
        const lastChallengedTime = new Date(lastChallengedDateStr + "T00:00:00Z").getTime();
        const daysSinceChallenge = Math.max(0, Math.floor((now - lastChallengedTime) / (1000 * 60 * 60 * 24)));
        score += daysSinceChallenge * 100;
      }

      // Older solutions get priority
      const solvedTime = p.date_solved ? new Date(p.date_solved).getTime() : new Date(p.date_added).getTime();
      const daysSinceSolved = Math.max(0, Math.floor((now - solvedTime) / (1000 * 60 * 60 * 24)));
      score += daysSinceSolved * 5;

      // Organic random jitter
      score += Math.floor(Math.random() * 50);

      return {
        problem: p,
        score,
        daysSinceSolved,
      };
    });

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.score - a.score);
    const selected = scoredCandidates[0];

    // 6. Insert new daily challenge record
    const { data: newChallenge, error: insertError } = await supabase
      .from("daily_challenges")
      .insert({
        user_id: user.id,
        challenge_date: today,
        problem_id: selected.problem.id,
        completed: false,
      })
      .select("*")
      .single();

    if (insertError || !newChallenge) {
      // In case of concurrent creation, fetch the winning row
      const { data: fallback } = await supabase
        .from("daily_challenges")
        .select("*, problems(*)")
        .eq("user_id", user.id)
        .eq("challenge_date", today)
        .single();

      if (fallback && fallback.problems) {
        const prob = (Array.isArray(fallback.problems) ? fallback.problems[0] : fallback.problems) as Problem;
        const dateSolved = prob.date_solved ? new Date(prob.date_solved).getTime() : new Date(prob.date_added).getTime();
        const days = Math.max(0, Math.floor((Date.now() - dateSolved) / (1000 * 60 * 60 * 24)));

        return {
          id: fallback.id,
          user_id: fallback.user_id,
          challenge_date: fallback.challenge_date,
          problem_id: fallback.problem_id,
          completed: fallback.completed,
          completed_at: fallback.completed_at,
          created_at: fallback.created_at,
          updated_at: fallback.updated_at,
          problem: prob,
          daysSinceLastSolved: days,
        };
      }

      return null;
    }

    return {
      id: newChallenge.id,
      user_id: newChallenge.user_id,
      challenge_date: newChallenge.challenge_date,
      problem_id: newChallenge.problem_id,
      completed: newChallenge.completed,
      completed_at: newChallenge.completed_at,
      created_at: newChallenge.created_at,
      updated_at: newChallenge.updated_at,
      problem: selected.problem,
      daysSinceLastSolved: selected.daysSinceSolved,
    };
  } catch (err) {
    console.error("Error in getTodayDailyChallenge:", err);
    return null;
  }
}

/**
 * Marks today's daily challenge as completed upon explicit user verification ("✓ I Solved It").
 */
export async function completeDailyChallenge(
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const nowIso = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("daily_challenges")
      .update({
        completed: true,
        completed_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", challengeId)
      .eq("user_id", user.id)
      .select("challenge_date")
      .single();

    if (error || !updated) {
      console.error("Error completing daily challenge:", error);
      return { success: false, error: error?.message || "Failed to complete challenge" };
    }

    // Idempotently sync daily_activity for that challenge date
    await syncDailyActivityForDate(user.id, updated.challenge_date);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to mark daily challenge as solved";
    return { success: false, error: msg };
  }
}

/**
 * Calculates Daily Challenge Streak from authoritative daily_challenges table.
 */
export async function getDailyChallengeStreakInfo(): Promise<DailyChallengeStreakInfo> {
  const defaultInfo: DailyChallengeStreakInfo = {
    currentStreak: 0,
    longestStreak: 0,
    completedToday: false,
  };

  try {
    const { supabase, user } = await getAuthenticatedUser();
    const today = await formatDateStr(new Date());

    // Fetch all completed challenges for this user
    const { data: completedChallenges, error } = await supabase
      .from("daily_challenges")
      .select("challenge_date")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("challenge_date", { ascending: false });

    if (error || !completedChallenges) {
      return defaultInfo;
    }

    const completedDatesSet = new Set<string>();
    for (const c of completedChallenges) {
      completedDatesSet.add(c.challenge_date);
    }

    const completedToday = completedDatesSet.has(today);

    // 1. Calculate Current Daily Challenge Streak
    let currentStreak = 0;
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (completedDatesSet.has(today)) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
      while (true) {
        const prevStr = await formatDateStr(d);
        if (completedDatesSet.has(prevStr)) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Today is not completed yet -> check yesterday backwards
      d.setDate(d.getDate() - 1);
      const yesterdayStr = await formatDateStr(d);
      if (completedDatesSet.has(yesterdayStr)) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
        while (true) {
          const prevStr = await formatDateStr(d);
          if (completedDatesSet.has(prevStr)) {
            currentStreak++;
            d.setDate(d.getDate() - 1);
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0;
      }
    }

    // 2. Calculate Longest Streak
    let longestStreak = 0;
    const sortedCompleted = Array.from(completedDatesSet).sort();

    if (sortedCompleted.length > 0) {
      let tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < sortedCompleted.length; i++) {
        const prevDate = new Date(sortedCompleted[i - 1] + "T00:00:00Z");
        const currDate = new Date(sortedCompleted[i] + "T00:00:00Z");
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return {
      currentStreak,
      longestStreak,
      completedToday,
    };
  } catch (err) {
    console.error("Error in getDailyChallengeStreakInfo:", err);
    return defaultInfo;
  }
}
