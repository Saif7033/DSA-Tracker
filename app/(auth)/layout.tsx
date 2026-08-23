import * as React from "react";
import { Code2, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-1">
            <Code2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            DSA Tracker
            <Sparkles className="h-4 w-4 text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400">
            Personal algorithmic problem solving & mastery workspace
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-black/50">
          {children}
        </div>
      </div>
    </div>
  );
}
