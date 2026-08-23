import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getDifficultyColor(difficulty: "Easy" | "Medium" | "Hard" | string) {
  switch (difficulty) {
    case "Easy":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        badge: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
      };
    case "Medium":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        badge: "bg-amber-950/60 text-amber-300 border-amber-800/40",
      };
    case "Hard":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/20",
        badge: "bg-rose-950/60 text-rose-300 border-rose-800/40",
      };
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-400",
        border: "border-slate-500/20",
        badge: "bg-slate-800 text-slate-300 border-slate-700",
      };
  }
}

export function getStatusColor(status: "Unsolved" | "Attempted" | "Solved" | string) {
  switch (status) {
    case "Solved":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        badge: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
      };
    case "Attempted":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/30",
        badge: "bg-blue-950/80 text-blue-300 border-blue-700/50",
      };
    case "Unsolved":
    default:
      return {
        bg: "bg-slate-800/40",
        text: "text-slate-400",
        border: "border-slate-700/50",
        badge: "bg-slate-800 text-slate-400 border-slate-700",
      };
  }
}
