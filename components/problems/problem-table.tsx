import * as React from "react";
import Link from "next/link";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { Problem } from "@/types/database.types";
import { formatDate, getDifficultyColor, getStatusColor } from "@/lib/utils";

interface ProblemTableProps {
  problems: Problem[];
}

export function ProblemTable({ problems }: ProblemTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4 font-semibold">Title</th>
            <th className="py-3 px-4 font-semibold">Difficulty</th>
            <th className="py-3 px-4 font-semibold">Topic</th>
            <th className="py-3 px-4 font-semibold">Pattern</th>
            <th className="py-3 px-4 font-semibold">Platform</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Date Added</th>
            <th className="py-3 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {problems.map((problem) => {
            const diff = getDifficultyColor(problem.difficulty);
            const statusColor = getStatusColor(problem.status);

            return (
              <tr
                key={problem.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                <td className="py-3 px-4 font-medium text-slate-200">
                  <Link
                    href={`/problems/${problem.id}`}
                    className="hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5"
                  >
                    {problem.title}
                    {problem.problem_url && (
                      <span className="text-slate-500" title="External link">
                        ↗
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${diff.badge}`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">{problem.topic}</td>
                <td className="py-3 px-4 text-slate-400">
                  {problem.pattern || "—"}
                </td>
                <td className="py-3 px-4 text-slate-400">{problem.platform}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusColor.badge}`}
                  >
                    {problem.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 text-xs">
                  {formatDate(problem.date_added)}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/problems/${problem.id}`}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-0.5"
                  >
                    Details <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
