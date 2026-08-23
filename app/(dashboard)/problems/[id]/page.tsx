import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Layers,
  Tag,
  Clock,
  Zap,
  AlertTriangle,
  FileText,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProblemById } from "@/lib/actions/problems";
import { StatusActions } from "@/components/problems/status-actions";
import { formatDate, formatDateTime, getDifficultyColor, getStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProblemDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ProblemDetailsPage({ params }: ProblemDetailsPageProps) {
  const problem = await getProblemById(params.id);

  if (!problem) {
    notFound();
  }

  const diff = getDifficultyColor(problem.difficulty);
  const statusColor = getStatusColor(problem.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Navigation & Edit Action */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/problems">
          <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            All Problems
          </Button>
        </Link>

        <Link href={`/problems/${problem.id}/edit`}>
          <Button variant="secondary" size="sm" className="h-9 px-4 text-xs gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            Edit Problem
          </Button>
        </Link>
      </div>

      {/* Main Header Card */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono uppercase text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800/80">
              {problem.platform}
            </span>
            <span className={`px-2.5 py-0.5 rounded font-medium border ${diff.badge}`}>
              {problem.difficulty}
            </span>
            <span className={`px-2.5 py-0.5 rounded font-medium border ${statusColor.badge}`}>
              {problem.status}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {problem.title}
            </h1>
            {problem.problem_url && (
              <a
                href={problem.problem_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors pt-1"
              >
                Open Original Problem on {problem.platform}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">Topic:</span>
              <span className="font-medium text-slate-200">{problem.topic}</span>
            </div>

            {problem.pattern && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Pattern:</span>
                <span className="font-medium text-slate-200">{problem.pattern}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 ml-auto text-slate-400">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Added: {formatDate(problem.date_added)}</span>
              {problem.date_solved && (
                <span className="text-emerald-400 font-medium ml-2">
                  (Solved: {formatDate(problem.date_solved)})
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Status Bar */}
      <Card className="border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Status Update:
          </span>
          <StatusActions problemId={problem.id} currentStatus={problem.status} />
        </div>
      </Card>

      {/* Complexity Badges */}
      {(problem.time_complexity || problem.space_complexity) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400">Time Complexity</span>
              </div>
              <span className="font-mono text-sm font-semibold text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded">
                {problem.time_complexity || "Not specified"}
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-slate-400">Space Complexity</span>
              </div>
              <span className="font-mono text-sm font-semibold text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded">
                {problem.space_complexity || "Not specified"}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimal Approach */}
      {problem.optimal_approach && (
        <Card className="border-emerald-900/40 bg-slate-900/50">
          <CardHeader className="pb-3 border-b border-emerald-900/30">
            <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Optimal Approach & Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-200 bg-slate-950/80 p-4 rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
              {problem.optimal_approach}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Brute Force Approach */}
      {problem.brute_force && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Code className="h-4 w-4 text-slate-400" />
              Brute Force Intuition
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 overflow-x-auto leading-relaxed">
              {problem.brute_force}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Description / Summary */}
      {problem.description && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              Problem Notes / Description
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </CardContent>
        </Card>
      )}

      {/* Mistakes & Pitfalls */}
      {problem.mistakes && (
        <Card className="border-rose-900/40 bg-rose-950/10">
          <CardHeader className="pb-3 border-b border-rose-900/30">
            <CardTitle className="text-sm font-semibold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Mistakes & Pitfalls (What to watch out for)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 text-xs sm:text-sm text-rose-200 leading-relaxed whitespace-pre-wrap">
            {problem.mistakes}
          </CardContent>
        </Card>
      )}

      {/* Personal Notes */}
      {problem.notes && (
        <Card className="border-blue-900/40 bg-blue-950/10">
          <CardHeader className="pb-3 border-b border-blue-900/30">
            <CardTitle className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Revision & Follow-up Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 text-xs sm:text-sm text-blue-200 leading-relaxed whitespace-pre-wrap">
            {problem.notes}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
