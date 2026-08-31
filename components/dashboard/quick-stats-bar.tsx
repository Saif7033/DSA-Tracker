import * as React from "react";
import { Award, CalendarCheck, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QuickStatsSummary } from "@/types/dsa.types";

interface QuickStatsBarProps {
  quickStats: QuickStatsSummary;
}

export function QuickStatsBar({ quickStats }: QuickStatsBarProps) {
  const items = [
    {
      label: "This Week",
      value: quickStats.solvedThisWeek,
      icon: CalendarCheck,
      color: "text-blue-400",
    },
    {
      label: "This Month",
      value: quickStats.solvedThisMonth,
      icon: TrendingUp,
      color: "text-indigo-400",
    },
    {
      label: "Total Solved",
      value: quickStats.totalSolved,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="border-slate-800/80 bg-slate-900/40"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {item.value}{" "}
                  <span className="text-xs font-normal text-slate-400">problems</span>
                </p>
              </div>

              <div className={`h-8 w-8 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center ${item.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
