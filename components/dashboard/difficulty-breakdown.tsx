import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types/dsa.types";

interface DifficultyBreakdownProps {
  byDifficulty: DashboardStats["byDifficulty"];
}

export function DifficultyBreakdown({ byDifficulty }: DifficultyBreakdownProps) {
  const difficulties = [
    {
      name: "Easy",
      data: byDifficulty.Easy,
      barColor: "bg-emerald-500",
      textColor: "text-emerald-400",
      badgeColor: "bg-emerald-950/60 border-emerald-800/40 text-emerald-300",
    },
    {
      name: "Medium",
      data: byDifficulty.Medium,
      barColor: "bg-amber-500",
      textColor: "text-amber-400",
      badgeColor: "bg-amber-950/60 border-amber-800/40 text-amber-300",
    },
    {
      name: "Hard",
      data: byDifficulty.Hard,
      barColor: "bg-rose-500",
      textColor: "text-rose-400",
      badgeColor: "bg-rose-950/60 border-rose-800/40 text-rose-300",
    },
  ];

  return (
    <Card className="border-slate-800/80 bg-slate-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-200">
          <span>Difficulty Distribution</span>
          <span className="text-xs font-normal text-slate-400">Solved / Total</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {difficulties.map((diff) => {
          const total = diff.data.total;
          const solved = diff.data.solved;
          const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

          return (
            <div key={diff.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${diff.textColor}`}>{diff.name}</span>
                  <span className="text-slate-400">
                    ({diff.data.attempted} attempted, {diff.data.unsolved} unsolved)
                  </span>
                </div>
                <div className="font-mono text-slate-300">
                  <span className="font-bold text-white">{solved}</span> / {total}{" "}
                  <span className="text-slate-400 text-[11px]">({percentage}%)</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${diff.barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
