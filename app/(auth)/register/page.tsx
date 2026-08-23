"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/lib/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await registerAction(data);
      if (!res.success) {
        setServerError(res.error || "Failed to register account");
        setIsSubmitting(false);
        return;
      }

      if (res.sessionActive) {
        setSuccessMessage("Account created! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setSuccessMessage(res.message || "Registration successful!");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Create Account</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Start building your personal DSA problem solving catalog
        </p>
      </div>

      {serverError && (
        <Alert variant="error" title="Registration Error">
          {serverError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Account Created">
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="developer@example.com"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          required
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full h-10 mt-2 text-sm font-medium"
          isLoading={isSubmitting}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create Account
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-slate-800 text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
}
