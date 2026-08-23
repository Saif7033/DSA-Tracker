import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "info";
  title?: string;
  children: React.ReactNode;
}

export function Alert({ variant = "info", title, children, className, ...props }: AlertProps) {
  const styles = {
    error: "bg-rose-950/40 border-rose-800/50 text-rose-300",
    success: "bg-emerald-950/40 border-emerald-800/50 text-emerald-300",
    info: "bg-blue-950/40 border-blue-800/50 text-blue-300",
  };

  const Icon = variant === "error" ? AlertCircle : variant === "success" ? CheckCircle2 : Info;

  return (
    <div
      className={cn("flex gap-3 rounded-lg border p-3.5 text-sm", styles[variant], className)}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="space-y-0.5 text-xs sm:text-sm">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
