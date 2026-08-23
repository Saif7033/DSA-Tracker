import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types/dsa.types";

interface TopicDistributionProps {
  byTopic: DashboardStats["byTopic"];
}

export function TopicDistribution({ byTopic }: TopicDistributionProps) {
  if (byTopic.length === 0) {
    return (
      <Card className="border-slate-800/80 bg-slate-900/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-200">Topic Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-xs text-slate-500">
            No problems recorded yet. Add problems to see topic statistics.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800/80 bg-slate-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-200">
          <span>Topic Mastery</span>
          <span className="text-xs font-normal text-slate-400">{byTopic.length} active topics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
          {byTopic.map((item) => (
            <div
              key={item.topic}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-200 truncate pr-2">{item.topic}</span>
                <span className="font-mono text-slate-400 shrink-0">
                  <span className="text-emerald-400 font-semibold">{item.solved}</span>/{item.total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
