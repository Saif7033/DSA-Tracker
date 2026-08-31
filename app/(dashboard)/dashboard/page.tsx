import * as React from "react";
import { getUserProfile } from "@/lib/actions/profile";
import { getDashboardStats } from "@/lib/actions/problems";
import { getPracticeStreakInfo, getMonthlyActivityHeatmap, getQuickStatsSummary } from "@/lib/actions/daily-activity";
import { getTodayDailyChallenge, getDailyChallengeStreakInfo } from "@/lib/actions/daily-challenge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StreakCards } from "@/components/dashboard/streak-cards";
import { DailyChallengeCard } from "@/components/dashboard/daily-challenge-card";
import { MonthlyHeatmap } from "@/components/dashboard/monthly-heatmap";
import { QuickStatsBar } from "@/components/dashboard/quick-stats-bar";
import { DifficultyBreakdown } from "@/components/dashboard/difficulty-breakdown";
import { TopicDistribution } from "@/components/dashboard/topic-distribution";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Parallel data fetching for high performance
  const [
    profile,
    stats,
    practiceStreak,
    challengeStreak,
    todayChallenge,
    initialHeatmap,
    quickStats,
  ] = await Promise.all([
    getUserProfile(),
    getDashboardStats(),
    getPracticeStreakInfo(),
    getDailyChallengeStreakInfo(),
    getTodayDailyChallenge(),
    getMonthlyActivityHeatmap(currentYear, currentMonth),
    getQuickStatsSummary(),
  ]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Greeting & Configurable Daily Goal */}
      <DashboardHeader profile={profile} />

      {/* 2. Independent Streak Cards (Practice vs Daily Challenge) */}
      <StreakCards
        practiceStreak={practiceStreak}
        challengeStreak={challengeStreak}
      />

      {/* 3. Dedicated Daily Challenge Section */}
      <DailyChallengeCard challenge={todayChallenge} />

      {/* 4. LeetCode-Inspired Monthly Activity Heatmap */}
      <MonthlyHeatmap initialData={initialHeatmap} />

      {/* 5. Concise Quick Stats (This Week, This Month, Total Solved) */}
      <QuickStatsBar quickStats={quickStats} />

      {/* 6. Visual Mastery Analytics (Difficulty & Topic Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DifficultyBreakdown byDifficulty={stats.byDifficulty} />
        <TopicDistribution byTopic={stats.byTopic} />
      </div>

      {/* 7. Tracker Activity Logs & Recently Solved */}
      <RecentActivity
        recentActivity={stats.recentActivity}
        recentSolved={stats.recentSolved}
      />
    </div>
  );
}
