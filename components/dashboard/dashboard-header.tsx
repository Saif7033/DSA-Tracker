"use client";

import * as React from "react";
import Link from "next/link";
import { PlusCircle, Target, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types/database.types";
import { updateDailyGoal } from "@/lib/actions/profile";

interface DashboardHeaderProps {
  profile: Profile;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const [currentGoal, setCurrentGoal] = React.useState(profile.daily_goal || 3);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName =
    profile.full_name ||
    (profile.email ? profile.email.split("@")[0] : "Engineer");

  const goalOptions = [1, 2, 3, 5, 10];

  const handleGoalChange = async (newGoal: number) => {
    if (newGoal === currentGoal) {
      setIsOpen(false);
      return;
    }
    setIsUpdating(true);
    setCurrentGoal(newGoal);
    setIsOpen(false);
    try {
      await updateDailyGoal(newGoal);
    } catch (err) {
      console.error("Failed to update daily goal:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
          <span>DSA Tracker</span>
          <span>•</span>
          <span className="text-blue-400">Mastery Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Track consistency, solve daily challenges, and maintain your problem solving history.
        </p>
      </div>

      <div className="flex items-center gap-2.5 sm:self-center">
        {/* Goal Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isUpdating}
            className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-700/80 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Configure Daily Practice Goal"
          >
            <Target className="h-3.5 w-3.5 text-blue-400" />
            <span>Goal: <strong className="text-white font-semibold">{currentGoal}/day</strong></span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 mb-1">
                Select Daily Goal
              </div>
              {goalOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleGoalChange(opt)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                    opt === currentGoal
                      ? "bg-blue-600/20 text-blue-400 font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{opt} problems / day</span>
                  {opt === currentGoal && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add Problem CTA */}
        <Link href="/problems/new">
          <Button variant="primary" size="sm" className="h-9 gap-1.5 shadow-sm shadow-blue-500/20">
            <PlusCircle className="h-4 w-4" />
            Add Problem
          </Button>
        </Link>
      </div>
    </div>
  );
}
