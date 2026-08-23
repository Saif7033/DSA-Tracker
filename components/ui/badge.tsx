import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-950/80 text-blue-300 border-blue-800/40",
    secondary: "bg-slate-800 text-slate-300 border-slate-700",
    outline: "border-slate-700 text-slate-300 bg-transparent",
    success: "bg-emerald-950/80 text-emerald-300 border-emerald-800/40",
    warning: "bg-amber-950/80 text-amber-300 border-amber-800/40",
    danger: "bg-rose-950/80 text-rose-300 border-rose-800/40",
    info: "bg-cyan-950/80 text-cyan-300 border-cyan-800/40",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded",
    md: "px-2.5 py-1 text-xs font-semibold rounded-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border font-medium transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
