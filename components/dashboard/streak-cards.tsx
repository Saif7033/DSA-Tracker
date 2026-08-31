import * as React from "react";
import { CheckCircle2, Flame, Swords, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeStreakInfo, DailyChallengeStreakInfo } from "@/types/dsa.types";

interface StreakCardsProps {
  practiceStreak: PracticeStreakInfo;
  challengeStreak: DailyChallengeStreakInfo;
}

export function StreakCards({ practiceStreak, challengeStreak }: StreakCardsProps) {
  const goalProgress = Math.min(
    100,
    Math.round((practiceStreak.todaySolved / practiceStreak.dailyGoal) * 100)
  );

  const remaining = Math.max(0, practiceStreak.dailyGoal - practiceStreak.todaySolved);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. REGULAR PRACTICE STREAK CARD */}
      <Card className="relative overflow-hidden border-slate-800/80 bg-slate-900/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Practice Streak
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Goal:</span>
              <strong className="text-slate-200">{practiceStreak.dailyGoal}/day</strong>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{practiceStreak.currentStreak}</span>
                <span className="text-sm font-normal text-slate-400">days</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Longest: <strong className="text-slate-300 font-medium">{practiceStreak.longestStreak} days</strong>
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-slate-200">
                {practiceStreak.todaySolved} / {practiceStreak.dailyGoal}
              </div>
              <p className="text-[11px] text-slate-400">
                {practiceStreak.goalCompletedToday ? (
                  <span className="text-emerald-400 font-medium">Goal completed today ✓</span>
                ) : (
                  <span>{remaining} remaining today</span>
                )}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                practiceStreak.goalCompletedToday ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. DAILY CHALLENGE STREAK CARD */}
      <Card className="relative overflow-hidden border-slate-800/80 bg-slate-900/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Swords className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Daily Challenge Streak
              </span>
            </div>

            <div>
              {challengeStreak.completedToday ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Solved today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  Pending today
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{challengeStreak.currentStreak}</span>
                <span className="text-sm font-normal text-slate-400">days</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Longest: <strong className="text-slate-300 font-medium">{challengeStreak.longestStreak} days</strong>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">
                Solve 1 previously solved problem daily to maintain mastery
              </p>
            </div>
          </div>

          {/* Status Indicator line */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                challengeStreak.completedToday ? "bg-amber-400 w-full" : "bg-slate-700 w-0"
              }`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
