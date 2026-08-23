import * as React from "react";
import { CheckCircle2, Clock, HelpCircle, Layers, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types/dsa.types";

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: "Total Tracked",
      value: stats.total,
      subtitle: `${stats.completionPercentage}% solved overall`,
      icon: Layers,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Solved",
      value: stats.solved,
      subtitle: `${stats.total > 0 ? ((stats.solved / stats.total) * 100).toFixed(0) : 0}% completion`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Attempted",
      value: stats.attempted,
      subtitle: "In progress / revision",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Unsolved",
      value: stats.unsolved,
      subtitle: "Queued in backlog",
      icon: HelpCircle,
      color: "text-slate-400",
      bg: "bg-slate-800/40 border-slate-700/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden border-slate-800/80 bg-slate-900/40">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                  {card.title}
                </p>
                <div className={`h-7 w-7 rounded-md ${card.bg} border flex items-center justify-center ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {card.value}
                </span>
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-400 truncate">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
