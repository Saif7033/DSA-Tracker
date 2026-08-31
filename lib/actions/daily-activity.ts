"use server";

import { createClient } from "@/lib/supabase/server";
import { DailyActivity } from "@/types/database.types";
import { HeatmapMonthData, HeatmapDayData, PracticeStreakInfo, QuickStatsSummary } from "@/types/dsa.types";

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
 * Format Date as YYYY-MM-DD in local/ISO format
 */
export async function formatDateStr(d: Date): Promise<string> {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Idempotently recalculates and updates daily_activity for a specific user and date.
 * Reprocessing the same problem or reloading never creates duplicate or inflated counts.
 */
export async function syncDailyActivityForDate(
  userId: string,
  dateStr: string,
  explicitGoal?: number
): Promise<DailyActivity | null> {
  try {
    const supabase = await createClient();

    // 1. Get user profile for daily goal if not provided
    let goal = explicitGoal;
    if (!goal) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("daily_goal")
        .eq("id", userId)
        .maybeSingle();
      goal = profile?.daily_goal || 3;
    }

    // 2. Count distinct regular solved problems on this date
    // Matching date_solved substring "YYYY-MM-DD"
    const startIso = `${dateStr}T00:00:00.000Z`;
    const endIso = `${dateStr}T23:59:59.999Z`;

    const { data: solvedProblems } = await supabase
      .from("problems")
      .select("id, date_solved")
      .eq("user_id", userId)
      .eq("status", "Solved")
      .gte("date_solved", startIso)
      .lte("date_solved", endIso);

    const regularSolved = solvedProblems ? solvedProblems.length : 0;

    // 3. Check if daily challenge was completed on this date
    const { data: challenge } = await supabase
      .from("daily_challenges")
      .select("completed")
      .eq("user_id", userId)
      .eq("challenge_date", dateStr)
      .maybeSingle();

    const challengeSolved = challenge?.completed ? 1 : 0;
    const totalSolved = regularSolved + challengeSolved;
    const goalCompleted = regularSolved >= goal;

    // 4. Idempotently upsert the record
    const { data: upserted, error: upsertError } = await supabase
      .from("daily_activity")
      .upsert(
        {
          user_id: userId,
          activity_date: dateStr,
          problems_solved: totalSolved,
          regular_problems_solved: regularSolved,
          daily_challenge_solved: challengeSolved,
          daily_goal: goal,
          goal_completed: goalCompleted,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,activity_date",
        }
      )
      .select("*")
      .single();

    if (upsertError) {
      console.error("Error syncing daily activity:", upsertError);
      return null;
    }

    return upserted;
  } catch (err) {
    console.error("Error in syncDailyActivityForDate:", err);
    return null;
  }
}

/**
 * Calculates Practice Streak and Goal Progress from authoritative daily_activity history.
 */
export async function getPracticeStreakInfo(): Promise<PracticeStreakInfo> {
  const defaultInfo: PracticeStreakInfo = {
    currentStreak: 0,
    longestStreak: 0,
    todaySolved: 0,
    dailyGoal: 3,
    goalCompletedToday: false,
  };

  try {
    const { supabase, user } = await getAuthenticatedUser();
    const today = await formatDateStr(new Date());

    // Sync today's activity first to ensure up-to-date values
    const todayActivity = await syncDailyActivityForDate(user.id, today);

    // Fetch all historical daily activity for this user
    const { data: activities, error } = await supabase
      .from("daily_activity")
      .select("activity_date, regular_problems_solved, daily_goal, goal_completed")
      .eq("user_id", user.id)
      .order("activity_date", { ascending: false });

    if (error || !activities) {
      return defaultInfo;
    }

    const dailyGoal = todayActivity?.daily_goal || 3;
    const todaySolved = todayActivity?.regular_problems_solved || 0;
    const goalCompletedToday = todayActivity?.goal_completed || false;

    // Create a Set of completed dates
    const completedDatesSet = new Set<string>();
    for (const act of activities) {
      if (act.goal_completed) {
        completedDatesSet.add(act.activity_date);
      }
    }

    // 1. Calculate Current Practice Streak
    let currentStreak = 0;
    const now = new Date();
    
    // Check from today or yesterday
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = await formatDateStr(d);
    
    if (completedDatesSet.has(todayStr)) {
      // Today is completed -> count today and go backwards
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
      // Today is not completed yet -> check if yesterday was completed
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

    // 2. Calculate Longest Practice Streak across all history
    let longestStreak = 0;
    const sortedCompleted = Array.from(completedDatesSet).sort(); // chronological

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
      todaySolved,
      dailyGoal,
      goalCompletedToday,
    };
  } catch (err) {
    console.error("Error in getPracticeStreakInfo:", err);
    return defaultInfo;
  }
}

/**
 * Returns LeetCode-style monthly calendar heatmap with week grouping and problem lists per day.
 */
export async function getMonthlyActivityHeatmap(
  year: number,
  month: number // 0-indexed: 0=Jan, 11=Dec
): Promise<HeatmapMonthData> {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const monthName = monthNames[month] || "January";

  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Determine first and last day of the target month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday-based calendar start (1 = Monday, ..., 7 = Sunday)
    // In JS: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sun
    const daysBefore = (startDayOfWeek + 6) % 7; // days from Monday to day 1

    const calendarStartDate = new Date(year, month, 1 - daysBefore);

    // Monday-based calendar end (Sunday of the last week)
    const endDayOfWeek = lastDayOfMonth.getDay();
    const daysAfter = (7 - endDayOfWeek) % 7; // days from last day to Sunday
    const calendarEndDate = new Date(year, month, lastDayOfMonth.getDate() + daysAfter);

    const rangeStartIso = calendarStartDate.toISOString();
    const rangeEndIso = calendarEndDate.toISOString().split("T")[0] + "T23:59:59.999Z";

    // Fetch all solved problems in this broad date range
    const { data: problems } = await supabase
      .from("problems")
      .select("id, title, difficulty, topic, platform, date_solved")
      .eq("user_id", user.id)
      .eq("status", "Solved")
      .gte("date_solved", rangeStartIso)
      .lte("date_solved", rangeEndIso);

    // Fetch all daily challenges completed in this date range
    const startStr = await formatDateStr(calendarStartDate);
    const endStr = await formatDateStr(calendarEndDate);

    const { data: challenges } = await supabase
      .from("daily_challenges")
      .select("id, challenge_date, problem_id, completed, problems(id, title, difficulty, topic, platform)")
      .eq("user_id", user.id)
      .gte("challenge_date", startStr)
      .lte("challenge_date", endStr)
      .eq("completed", true);

    const now = new Date();
    const todayStr = await formatDateStr(now);

    // Build day map
    const problemsByDate: Record<string, HeatmapDayData["problems"]> = {};
    let totalSolvedInMonth = 0;

    if (problems) {
      for (const p of problems) {
        if (!p.date_solved) continue;
        const pDate = p.date_solved.split("T")[0];
        if (!problemsByDate[pDate]) problemsByDate[pDate] = [];
        problemsByDate[pDate].push({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.topic,
          platform: p.platform,
          isChallenge: false,
        });

        // Count if in target month
        const solvedD = new Date(p.date_solved);
        if (solvedD.getFullYear() === year && solvedD.getMonth() === month) {
          totalSolvedInMonth++;
        }
      }
    }

    if (challenges) {
      for (const c of challenges) {
        const cDate = c.challenge_date;
        if (!problemsByDate[cDate]) problemsByDate[cDate] = [];

        // Check if joined problem data exists
        const prob = Array.isArray(c.problems) ? c.problems[0] : c.problems;
        if (prob) {
          problemsByDate[cDate].push({
            id: prob.id,
            title: `[Daily Challenge] ${prob.title}`,
            difficulty: prob.difficulty,
            topic: prob.topic,
            platform: prob.platform,
            isChallenge: true,
          });

          const chD = new Date(cDate + "T00:00:00Z");
          if (chD.getFullYear() === year && chD.getMonth() === month) {
            totalSolvedInMonth++;
          }
        }
      }
    }

    // Build calendar matrix (Weeks -> Days)
    const weeks: HeatmapDayData[][] = [];
    let currentWeek: HeatmapDayData[] = [];
    const iterDate = new Date(calendarStartDate);

    while (iterDate <= calendarEndDate) {
      const dateStr = await formatDateStr(iterDate);
      const isCurrentMonth = iterDate.getMonth() === month;
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      const dayProblems = problemsByDate[dateStr] || [];
      const regularSolved = dayProblems.filter((p) => !p.isChallenge).length;
      const challengeSolved = dayProblems.filter((p) => p.isChallenge).length;
      const totalSolved = isFuture ? 0 : dayProblems.length;

      const dayData: HeatmapDayData = {
        date: dateStr,
        dayOfWeek: (iterDate.getDay() + 6) % 7 + 1, // 1=Mon, ..., 7=Sun
        dayOfMonth: iterDate.getDate(),
        isCurrentMonth,
        isToday,
        isFuture,
        totalSolved,
        regularSolved: isFuture ? 0 : regularSolved,
        challengeSolved: isFuture ? 0 : challengeSolved,
        problems: isFuture ? [] : dayProblems,
      };

      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      iterDate.setDate(iterDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return {
      year,
      month,
      monthName,
      weeks,
      totalSolvedInMonth,
    };
  } catch (err) {
    console.error("Error in getMonthlyActivityHeatmap:", err);
    return {
      year,
      month,
      monthName,
      weeks: [],
      totalSolvedInMonth: 0,
    };
  }
}

/**
 * Returns summary statistics for "This Week", "This Month", and "Total Solved".
 */
export async function getQuickStatsSummary(): Promise<QuickStatsSummary> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const now = new Date();

    // Start of current week (Monday)
    const dayOfWeek = now.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
    const startOfWeekIso = `${await formatDateStr(monday)}T00:00:00.000Z`;

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthIso = `${await formatDateStr(startOfMonth)}T00:00:00.000Z`;

    // Fetch solved counts
    const { data: allSolved } = await supabase
      .from("problems")
      .select("id, date_solved")
      .eq("user_id", user.id)
      .eq("status", "Solved");

    const totalSolved = allSolved ? allSolved.length : 0;

    let solvedThisWeek = 0;
    let solvedThisMonth = 0;

    if (allSolved) {
      for (const p of allSolved) {
        if (!p.date_solved) continue;
        if (p.date_solved >= startOfWeekIso) {
          solvedThisWeek++;
        }
        if (p.date_solved >= startOfMonthIso) {
          solvedThisMonth++;
        }
      }
    }

    // Include completed daily challenges
    const { data: challenges } = await supabase
      .from("daily_challenges")
      .select("challenge_date")
      .eq("user_id", user.id)
      .eq("completed", true);

    if (challenges) {
      const monStr = await formatDateStr(monday);
      const monthStartStr = await formatDateStr(startOfMonth);

      for (const c of challenges) {
        if (c.challenge_date >= monStr) {
          solvedThisWeek++;
        }
        if (c.challenge_date >= monthStartStr) {
          solvedThisMonth++;
        }
      }
    }

    return {
      solvedThisWeek,
      solvedThisMonth,
      totalSolved,
    };
  } catch (err) {
    console.error("Error in getQuickStatsSummary:", err);
    return {
      solvedThisWeek: 0,
      solvedThisMonth: 0,
      totalSolved: 0,
    };
  }
}
