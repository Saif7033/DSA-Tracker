"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Code2, LogIn, Lock, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/lib/actions/auth";

export function HomeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await loginAction(data);
      if (!res.success) {
        setServerError(res.error || "Invalid email or password");
        setIsSubmitting(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-wider">
          <Code2 className="h-3.5 w-3.5" />
          <span>DSA TRACKER</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Track. Solve. Grow.
          </h1>
          <p className="text-sm text-slate-400">
            Welcome back. Continue your coding journey.
          </p>
        </div>
      </div>

      {/* Glass Login Panel */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 shadow-2xl shadow-black/60 relative overflow-hidden">
        {/* Subtle top edge glow line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {serverError && (
          <div className="mb-4">
            <Alert variant="error" title="Sign In Error">
              {serverError}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Email Address"
              type="email"
              placeholder="developer@example.com"
              required
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-10 mt-2 text-sm font-medium shadow-lg shadow-blue-600/20"
            isLoading={isSubmitting}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Don&apos;t have an account?</span>
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Create Account
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Security & Isolation Note */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
        <Lock className="h-3 w-3 text-slate-400 shrink-0" />
        <span>End-to-end Row Level Security per personal account.</span>
      </div>
    </div>
  );
}
