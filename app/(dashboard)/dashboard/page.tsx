import * as React from "react";
import Link from "next/link";
import { PlusCircle, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/actions/problems";
import { StatCards } from "@/components/dashboard/stat-cards";
import { DifficultyBreakdown } from "@/components/dashboard/difficulty-breakdown";
import { TopicDistribution } from "@/components/dashboard/topic-distribution";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Dashboard
            <Sparkles className="h-5 w-5 text-blue-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Your personal DSA problem solving progress, statistics, and activity
          </p>
        </div>

        <Link href="/problems/new">
          <Button variant="primary" size="md" className="gap-2 shadow-sm shadow-blue-500/20">
            <PlusCircle className="h-4 w-4" />
            Add Problem
          </Button>
        </Link>
      </div>

      {/* Primary KPI Stats */}
      <StatCards stats={stats} />

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DifficultyBreakdown byDifficulty={stats.byDifficulty} />
        <TopicDistribution byTopic={stats.byTopic} />
      </div>

      {/* Activity Logs & Recently Solved */}
      <RecentActivity
        recentActivity={stats.recentActivity}
        recentSolved={stats.recentSolved}
      />
    </div>
  );
}
