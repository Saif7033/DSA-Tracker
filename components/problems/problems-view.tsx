"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, Table as TableIcon, PlusCircle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProblemCard } from "./problem-card";
import { ProblemTable } from "./problem-table";
import { Problem } from "@/types/database.types";

interface ProblemsViewProps {
  problems: Problem[];
}

export function ProblemsView({ problems }: ProblemsViewProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("table");

  if (problems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No problems found</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-5">
          No matching problems were found with your current filters or search terms. Try clearing filters or add a new problem.
        </p>
        <Link href="/problems/new">
          <Button variant="primary" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Problem
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{problems.length}</span>{" "}
          {problems.length === 1 ? "problem" : "problems"}
        </span>

        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === "table"
                ? "bg-slate-800 text-blue-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Table view"
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === "grid"
                ? "bg-slate-800 text-blue-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Card Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Render Table or Grid */}
      {viewMode === "table" ? (
        <ProblemTable problems={problems} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
}
