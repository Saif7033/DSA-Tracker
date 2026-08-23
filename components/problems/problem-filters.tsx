"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { DIFFICULTIES, STATUSES } from "@/lib/constants/dsa";

export function ProblemFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");

  const currentDifficulty = searchParams.get("difficulty") || "All";
  const currentStatus = searchParams.get("status") || "All";
  const currentPlatform = searchParams.get("platform") || "All";
  const currentSort = searchParams.get("sortBy") || "date_added_desc";

  const updateParam = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "All" && value.trim() !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Debounced search sync
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const current = searchParams.get("search") || "";
      if (searchTerm !== current) {
        updateParam("search", searchTerm);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, updateParam]);

  const hasActiveFilters =
    currentDifficulty !== "All" ||
    currentStatus !== "All" ||
    currentPlatform !== "All" ||
    searchTerm.trim() !== "" ||
    currentSort !== "date_added_desc";

  const resetFilters = () => {
    setSearchTerm("");
    router.replace(pathname);
  };

  return (
    <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, topic, pattern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/90 pl-9 pr-8 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Difficulty Filter */}
        <select
          value={currentDifficulty}
          onChange={(e) => updateParam("difficulty", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={currentSort}
          onChange={(e) => updateParam("sortBy", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="date_added_desc">Newest Added</option>
          <option value="date_added_asc">Oldest Added</option>
          <option value="title_asc">Title (A-Z)</option>
          <option value="difficulty_asc">Difficulty</option>
          <option value="status_asc">Status</option>
        </select>
      </div>

      {/* Quick Filter Status Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-blue-400" />
            Filters active
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
