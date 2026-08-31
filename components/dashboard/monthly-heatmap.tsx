"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Sparkles, X, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeatmapMonthData, HeatmapDayData } from "@/types/dsa.types";
import { getDifficultyColor } from "@/lib/utils";
import { getMonthlyActivityHeatmap } from "@/lib/actions/daily-activity";

interface MonthlyHeatmapProps {
  initialData: HeatmapMonthData;
}

export function MonthlyHeatmap({ initialData }: MonthlyHeatmapProps) {
  const [data, setData] = React.useState<HeatmapMonthData>(initialData);
  const [currentYear, setCurrentYear] = React.useState(initialData.year);
  const [currentMonth, setCurrentMonth] = React.useState(initialData.month);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<HeatmapDayData | null>(null);

  const months = [
    { name: "Jan", index: 0 },
    { name: "Feb", index: 1 },
    { name: "Mar", index: 2 },
    { name: "Apr", index: 3 },
    { name: "May", index: 4 },
    { name: "Jun", index: 5 },
    { name: "Jul", index: 6 },
    { name: "Aug", index: 7 },
    { name: "Sep", index: 8 },
    { name: "Oct", index: 9 },
    { name: "Nov", index: 10 },
    { name: "Dec", index: 11 },
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const loadMonthData = async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const monthData = await getMonthlyActivityHeatmap(year, month);
      setData(monthData);
      setCurrentYear(year);
      setCurrentMonth(month);
    } catch (err) {
      console.error("Failed to load month data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    if (monthIndex === currentMonth) return;
    loadMonthData(currentYear, monthIndex);
  };

  const handlePrevYear = () => {
    loadMonthData(currentYear - 1, currentMonth);
  };

  const handleNextYear = () => {
    loadMonthData(currentYear + 1, currentMonth);
  };

  // Intensity tier styling
  const getCellColor = (day: HeatmapDayData) => {
    if (!day.isCurrentMonth || day.isFuture) {
      return "bg-slate-950/40 border-slate-900/40 text-slate-700 opacity-40 cursor-default";
    }

    if (day.totalSolved === 0) {
      return "bg-slate-900/60 border-slate-800/60 text-slate-500 hover:border-slate-700";
    }
    if (day.totalSolved <= 2) {
      return "bg-blue-950 border-blue-800/70 text-blue-300 hover:border-blue-500 shadow-sm";
    }
    if (day.totalSolved <= 4) {
      return "bg-blue-800 border-blue-600 text-blue-100 hover:border-blue-400 shadow-sm";
    }
    if (day.totalSolved <= 7) {
      return "bg-blue-600 border-blue-400 text-white hover:border-blue-300 shadow-sm shadow-blue-600/30";
    }
    return "bg-sky-500 border-sky-300 text-white hover:border-white shadow-sm shadow-sky-500/50";
  };

  return (
    <Card className="border-slate-800/80 bg-slate-900/40 relative overflow-hidden">
      {/* Header: Title, Year Navigation, and Month Summary */}
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>ACTIVITY HEATMAP</span>
          </CardTitle>

          {/* Year Switcher & Solved Count */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              <strong className="text-white font-semibold">{data.totalSolvedInMonth}</strong> solved in {data.monthName}
            </span>

            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handlePrevYear}
                disabled={isLoading}
                className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
                title="Previous Year"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 font-mono font-medium text-slate-200 text-xs">
                {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextYear}
                disabled={isLoading || currentYear >= new Date().getFullYear()}
                className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-850 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                title="Next Year"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Month Selector Tabs (Jan - Dec) */}
        <div className="flex items-center gap-1 overflow-x-auto pt-3 pb-1 no-scrollbar border-t border-slate-850/60 mt-1">
          {months.map((m) => {
            const isSelected = m.index === currentMonth;
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => handleMonthSelect(m.index)}
                disabled={isLoading}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? "text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {m.name}
                {isSelected && (
                  <span className="absolute bottom-0 inset-x-2 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-mono font-semibold text-slate-500 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Weeks Matrix */}
        <div className="space-y-2">
          {data.weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const cellClasses = getCellColor(day);
                const isClickable = day.isCurrentMonth && !day.isFuture && day.totalSolved > 0;

                return (
                  <div
                    key={day.date}
                    onClick={() => {
                      if (isClickable) setSelectedDay(day);
                    }}
                    title={`${day.date}: ${day.totalSolved} solved`}
                    className={`h-11 sm:h-12 rounded-lg border flex flex-col justify-between p-1.5 transition-all text-xs select-none relative ${cellClasses} ${
                      isClickable ? "cursor-pointer hover:scale-[1.03] active:scale-[0.98]" : ""
                    } ${day.isToday ? "ring-1 ring-blue-400 ring-offset-1 ring-offset-slate-950" : ""}`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                      <span className={day.isToday ? "text-blue-400 font-bold" : ""}>
                        {day.dayOfMonth}
                      </span>
                      {day.isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" title="Today" />
                      )}
                    </div>

                    {day.totalSolved > 0 && day.isCurrentMonth && (
                      <div className="text-right text-[11px] font-bold tracking-tight">
                        {day.totalSolved}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div className="mt-5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Activity Intensity:</span>
            <div className="flex items-center gap-1 ml-1">
              <span className="h-3 w-3 rounded bg-slate-900 border border-slate-800" title="0 solved" />
              <span className="h-3 w-3 rounded bg-blue-950 border border-blue-800" title="1-2 solved" />
              <span className="h-3 w-3 rounded bg-blue-800 border border-blue-600" title="3-4 solved" />
              <span className="h-3 w-3 rounded bg-blue-600 border border-blue-400" title="5-7 solved" />
              <span className="h-3 w-3 rounded bg-sky-500 border-sky-300" title="8+ solved" />
            </div>
          </div>

          <div className="text-slate-500 text-[10px] font-mono">
            Click any active day to inspect solved problems
          </div>
        </div>
      </CardContent>

      {/* Interactive Day Inspection Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span>Activity for {selectedDay.date}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  <strong className="text-white">{selectedDay.totalSolved}</strong> problems solved (
                  {selectedDay.regularSolved} Regular Practice • {selectedDay.challengeSolved} Daily Challenge)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="h-8 w-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List of Problems Solved That Day */}
            <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
              {selectedDay.problems.map((p, idx) => {
                const diff = getDifficultyColor(p.difficulty);
                return (
                  <div
                    key={`${p.id}-${idx}`}
                    className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/problems/${p.id}`}
                        onClick={() => setSelectedDay(null)}
                        className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors truncate block"
                      >
                        {p.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{p.platform}</span>
                        <span>•</span>
                        <span>{p.topic}</span>
                        {p.isChallenge && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-mono font-medium">Daily Challenge</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${diff.badge} shrink-0`}>
                      {p.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDay(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
