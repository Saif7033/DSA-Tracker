"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Sparkles, Swords, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DailyChallengeWithProblem } from "@/types/dsa.types";
import { getDifficultyColor, formatDate } from "@/lib/utils";
import { completeDailyChallenge } from "@/lib/actions/daily-challenge";

interface DailyChallengeCardProps {
  challenge: DailyChallengeWithProblem | null;
}

export function DailyChallengeCard({ challenge }: DailyChallengeCardProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(challenge?.completed || false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleMarkSolved = async () => {
    if (!challenge || isCompleted) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await completeDailyChallenge(challenge.id);
      if (res.success) {
        setIsCompleted(true);
      } else {
        setErrorMsg(res.error || "Failed to mark as solved");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) {
    return (
      <Card className="border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800/60">
          <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-amber-400" />
              Daily Challenge
            </span>
            <span className="text-[11px] font-mono text-slate-500 uppercase">Spaced Repetition</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
            <Sparkles className="h-5 w-5 text-amber-400/80" />
          </div>
          <h4 className="text-sm font-medium text-slate-200 mb-1">
            Unlock Your Daily Challenge
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            The Daily Challenge picks one of your previously solved problems to test your recall and maintain mastery. Solve your first problem to activate it!
          </p>
          <Link href="/problems/new">
            <Button variant="outline" size="sm" className="text-xs">
              Add & Solve a Problem
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const problem = challenge.problem;
  const diff = getDifficultyColor(problem.difficulty);

  const leetCodeUrl =
    problem.problem_url ||
    `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problem.title)}`;

  return (
    <Card className="border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
      {/* Top ambient highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <CardHeader className="pb-3 border-b border-slate-800/60 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
          <Swords className="h-4 w-4 text-amber-400" />
          <span>DAILY CHALLENGE</span>
        </CardTitle>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 shadow-sm shadow-emerald-900/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Challenge Solved Today ✓
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20">
              <Clock className="h-3 w-3" />
              Active Today
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/problems/${problem.id}`}
                className="text-base sm:text-lg font-bold text-white hover:text-blue-400 transition-colors truncate block"
              >
                {problem.title}
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${diff.badge}`}>
                {problem.difficulty}
              </span>
              <span>•</span>
              <span className="text-slate-300 font-medium">{problem.topic}</span>
              {problem.pattern && (
                <>
                  <span>•</span>
                  <span className="text-slate-400">{problem.pattern}</span>
                </>
              )}
              <span>•</span>
              <span className="text-amber-300/80 font-mono text-[11px]">
                {challenge.daysSinceLastSolved === 0
                  ? "Solved today"
                  : `Previously solved ${challenge.daysSinceLastSolved} days ago`}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Primary CTA: Solve on LeetCode */}
            <a
              href={leetCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button
                variant="secondary"
                size="sm"
                className="h-9 gap-1.5 text-xs border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <span>Solve on LeetCode</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </a>

            {/* Completion CTA */}
            {isCompleted ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-9 text-xs border-emerald-800/60 bg-emerald-950/40 text-emerald-300 opacity-90 cursor-default"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                Completed
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkSolved}
                isLoading={isSubmitting}
                className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>✓ I Solved It</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
