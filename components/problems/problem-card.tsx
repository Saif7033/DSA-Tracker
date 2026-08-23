import * as React from "react";
import Link from "next/link";
import { ExternalLink, Calendar, Layers, Tag, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Problem } from "@/types/database.types";
import { formatDate, getDifficultyColor, getStatusColor } from "@/lib/utils";

interface ProblemCardProps {
  problem: Problem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  const diff = getDifficultyColor(problem.difficulty);
  const statusColor = getStatusColor(problem.status);

  return (
    <Card className="hover:border-slate-700 transition-all bg-slate-900/40 hover:bg-slate-900/70 group flex flex-col justify-between">
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              {problem.platform}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${diff.badge}`}>
                {problem.difficulty}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusColor.badge}`}>
                {problem.status}
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            href={`/problems/${problem.id}`}
            className="text-base font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 block"
          >
            {problem.title}
          </Link>

          {/* Topic & Pattern */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
              <Layers className="h-3 w-3 text-slate-400" />
              {problem.topic}
            </span>
            {problem.pattern && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/40 text-slate-400">
                <Tag className="h-3 w-3 text-slate-500" />
                {problem.pattern}
              </span>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-500" />
            {formatDate(problem.date_added)}
          </span>
          <Link
            href={`/problems/${problem.id}`}
            className="text-blue-400 group-hover:text-blue-300 font-medium flex items-center gap-0.5"
          >
            View Notes <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
