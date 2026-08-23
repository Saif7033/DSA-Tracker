import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/types/database.types";
import { formatDate, getDifficultyColor, getStatusColor } from "@/lib/utils";

interface RecentActivityProps {
  recentActivity: Problem[];
  recentSolved: Problem[];
}

export function RecentActivity({ recentActivity, recentSolved }: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recently Solved */}
      <Card className="border-slate-800/80 bg-slate-900/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Recently Solved
            </span>
            <Link
              href="/problems?status=Solved"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          {recentSolved.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No problems marked as solved yet. Keep solving!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentSolved.map((problem) => {
                const diff = getDifficultyColor(problem.difficulty);
                return (
                  <div
                    key={problem.id}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/problems/${problem.id}`}
                        className="text-xs sm:text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors truncate block"
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{problem.topic}</span>
                        <span>•</span>
                        <span>Solved on {formatDate(problem.date_solved)}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium shrink-0 border ${diff.badge}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-800/80 bg-slate-900/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Recent Tracker Activity
            </span>
            <Link
              href="/problems"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Explore all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent activity. Click &ldquo;Add Problem&rdquo; to begin tracking.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentActivity.map((problem) => {
                const diff = getDifficultyColor(problem.difficulty);
                const statusColor = getStatusColor(problem.status);
                return (
                  <div
                    key={problem.id}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/problems/${problem.id}`}
                        className="text-xs sm:text-sm font-medium text-slate-200 hover:text-blue-400 transition-colors truncate block"
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{problem.platform}</span>
                        <span>•</span>
                        <span>{problem.topic}</span>
                        <span>•</span>
                        <span>Added {formatDate(problem.date_added)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${statusColor.badge}`}
                      >
                        {problem.status}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${diff.badge}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
