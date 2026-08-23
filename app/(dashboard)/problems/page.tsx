import * as React from "react";
import Link from "next/link";
import { PlusCircle, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProblems } from "@/lib/actions/problems";
import { ProblemFilters } from "@/components/problems/problem-filters";
import { ProblemsView } from "@/components/problems/problems-view";
import { ProblemFilterOptions } from "@/types/dsa.types";

export const dynamic = "force-dynamic";

interface ProblemsPageProps {
  searchParams: {
    search?: string;
    difficulty?: string;
    status?: string;
    topic?: string;
    platform?: string;
    sortBy?: string;
  };
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const filters: ProblemFilterOptions = {
    search: searchParams.search,
    difficulty: searchParams.difficulty as ProblemFilterOptions["difficulty"],
    status: searchParams.status as ProblemFilterOptions["status"],
    topic: searchParams.topic,
    platform: searchParams.platform as ProblemFilterOptions["platform"],
    sortBy: searchParams.sortBy as ProblemFilterOptions["sortBy"],
  };

  const problems = await getProblems(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Problems
            <ListTodo className="h-5 w-5 text-blue-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Search, filter, and review all tracked algorithmic challenges
          </p>
        </div>

        <Link href="/problems/new">
          <Button variant="primary" size="md" className="gap-2 shadow-sm shadow-blue-500/20">
            <PlusCircle className="h-4 w-4" />
            Add Problem
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar wrapped in Suspense */}
      <React.Suspense fallback={<div className="h-24 rounded-xl bg-slate-900/40 animate-pulse border border-slate-800" />}>
        <ProblemFilters />
      </React.Suspense>

      {/* Problems Output */}
      <ProblemsView problems={problems} />
    </div>
  );
}
