"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { problemSchema, ProblemFormInput } from "@/lib/validations/problem";
import { createProblem, updateProblem } from "@/lib/actions/problems";
import { DIFFICULTIES, PLATFORMS, STATUSES, COMMON_TOPICS, COMMON_PATTERNS, COMMON_COMPLEXITIES } from "@/lib/constants/dsa";
import { Problem } from "@/types/database.types";
import { parseLeetCodeUrl } from "@/lib/utils/leetcode";

interface ProblemFormProps {
  initialData?: Problem;
  isEdit?: boolean;
}

export function ProblemForm({ initialData, isEdit = false }: ProblemFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [leetcodeUrl, setLeetcodeUrl] = React.useState("");
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProblemFormInput>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: initialData?.title || "",
      platform: initialData?.platform || "LeetCode",
      problem_url: initialData?.problem_url || "",
      difficulty: initialData?.difficulty || "Easy",
      topic: initialData?.topic || "Arrays & Hashing",
      pattern: initialData?.pattern || "",
      status: initialData?.status || "Unsolved",
      description: initialData?.description || "",
      approach: initialData?.approach || "",
      brute_force: initialData?.brute_force || "",
      optimal_approach: initialData?.optimal_approach || "",
      time_complexity: initialData?.time_complexity || "",
      space_complexity: initialData?.space_complexity || "",
      mistakes: initialData?.mistakes || "",
      notes: initialData?.notes || "",
    },
  });

  const handleParseLeetCodeUrl = () => {
    setUrlError(null);

    if (!leetcodeUrl.trim()) {
      setUrlError("Please enter a LeetCode URL");
      return;
    }

    const parsed = parseLeetCodeUrl(leetcodeUrl);
    if (!parsed) {
      setUrlError("Invalid LeetCode URL. Please enter a valid URL like: https://leetcode.com/problems/two-sum/");
      return;
    }

    // Auto-fill form fields
    setValue("title", parsed.title);
    setValue("platform", parsed.platform);
    setValue("problem_url", leetcodeUrl.trim());

    setLeetcodeUrl("");
    setUrlError(null);
  };

  const onSubmit = async (data: ProblemFormInput) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      if (isEdit && initialData) {
        const res = await updateProblem(initialData.id, data);
        if (!res.success) {
          setServerError(res.error || "Failed to update problem");
          setIsSubmitting(false);
          return;
        }
        router.push(`/problems/${initialData.id}`);
        router.refresh();
      } else {
        const res = await createProblem(data);
        if (!res.success) {
          setServerError(res.error || "Failed to save problem");
          setIsSubmitting(false);
          return;
        }
        router.push(`/problems/${res.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={isEdit && initialData ? `/problems/${initialData.id}` : "/problems"}>
            <Button type="button" variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isEdit ? "Edit Problem" : "Add New Problem"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {isEdit
                ? "Update your solution notes, complexity, and status"
                : "Log a newly solved or practiced DSA challenge"}
            </p>
          </div>
        </div>

        <Button type="submit" variant="primary" isLoading={isSubmitting} className="h-10 px-5 text-sm gap-2">
          <Save className="h-4 w-4" />
          {isEdit ? "Save Changes" : "Save Problem"}
        </Button>
      </div>

      {serverError && (
        <Alert variant="error" title="Submission Error">
          {serverError}
        </Alert>
      )}

      {/* LeetCode URL Parser Section */}
      {!isEdit && (
        <Card className="border-green-900/50 bg-green-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-green-300 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Quick Add: Paste LeetCode URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-300">
              Paste a LeetCode problem link below and we'll auto-fill the title and URL for you.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://leetcode.com/problems/two-sum/"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleParseLeetCodeUrl()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleParseLeetCodeUrl}
                className="whitespace-nowrap"
              >
                Parse URL
              </Button>
            </div>
            {urlError && <p className="text-xs text-red-400">{urlError}</p>}
          </CardContent>
        </Card>
      )}

      {/* Section 1: Core Problem Details */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-slate-200">1. Problem Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Problem Title"
                placeholder="e.g., Two Sum, LRU Cache, Course Schedule"
                required
                error={errors.title?.message}
                {...register("title")}
              />
            </div>

            <Select
              label="Platform"
              options={PLATFORMS.map((p) => ({ label: p, value: p }))}
              error={errors.platform?.message}
              {...register("platform")}
            />

            <Input
              label="Problem URL (optional)"
              placeholder="https://leetcode.com/problems/..."
              error={errors.problem_url?.message}
              {...register("problem_url")}
            />

            <Select
              label="Difficulty"
              required
              options={DIFFICULTIES.map((d) => ({ label: d, value: d }))}
              error={errors.difficulty?.message}
              {...register("difficulty")}
            />

            <Select
              label="Status"
              options={STATUSES.map((s) => ({ label: s, value: s }))}
              error={errors.status?.message}
              {...register("status")}
            />

            <div>
              <Input
                label="Topic"
                placeholder="e.g., Arrays & Hashing, Dynamic Programming"
                required
                list="topics-datalist"
                error={errors.topic?.message}
                {...register("topic")}
              />
              <datalist id="topics-datalist">
                {COMMON_TOPICS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div>
              <Input
                label="Algorithmic Pattern (optional)"
                placeholder="e.g., Two Pointers, Sliding Window, Monotonic Stack"
                list="patterns-datalist"
                error={errors.pattern?.message}
                {...register("pattern")}
              />
              <datalist id="patterns-datalist">
                {COMMON_PATTERNS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Complexity Analysis */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-slate-200">2. Complexity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Time Complexity"
                placeholder="e.g., O(N log N), O(N)"
                list="complexity-datalist"
                error={errors.time_complexity?.message}
                {...register("time_complexity")}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_COMPLEXITIES.map((c) => (
                  <button
                    key={`time-${c}`}
                    type="button"
                    onClick={() => setValue("time_complexity", c)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Input
                label="Space Complexity"
                placeholder="e.g., O(1), O(N)"
                list="complexity-datalist"
                error={errors.space_complexity?.message}
                {...register("space_complexity")}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_COMPLEXITIES.map((c) => (
                  <button
                    key={`space-${c}`}
                    type="button"
                    onClick={() => setValue("space_complexity", c)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <datalist id="complexity-datalist">
            {COMMON_COMPLEXITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </CardContent>
      </Card>

      {/* Section 3: Approaches & Code */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-slate-200">3. Solutions & Approaches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Optimal Approach (Code / Explanation)"
            placeholder="Describe the optimal intuition and paste code snippet..."
            className="min-h-[140px]"
            error={errors.optimal_approach?.message}
            {...register("optimal_approach")}
          />

          <Textarea
            label="Brute Force Approach"
            placeholder="Describe the naive/brute force approach and why it's inefficient..."
            className="min-h-[100px]"
            error={errors.brute_force?.message}
            {...register("brute_force")}
          />

          <Textarea
            label="General Description / Problem Statement Summary"
            placeholder="Summary of constraints, special edge cases, or input guarantees..."
            className="min-h-[90px]"
            error={errors.description?.message}
            {...register("description")}
          />
        </CardContent>
      </Card>

      {/* Section 4: Mistakes & Revision Notes */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-slate-200">4. Key Learnings & Mistakes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Mistakes & Pitfalls (What tripped you up?)"
            placeholder="e.g., Off-by-one error with upper bound, forgotten integer overflow edge case..."
            className="min-h-[90px]"
            error={errors.mistakes?.message}
            {...register("mistakes")}
          />

          <Textarea
            label="Personal Notes & Follow-up Reminders"
            placeholder="e.g., Review again before interview, solve the follow-up version..."
            className="min-h-[90px]"
            error={errors.notes?.message}
            {...register("notes")}
          />
        </CardContent>
      </Card>

      {/* Footer Submit Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href={isEdit && initialData ? `/problems/${initialData.id}` : "/problems"}>
          <Button type="button" variant="ghost" size="md">
            Cancel
          </Button>
        </Link>
        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="min-w-[140px]">
          <Save className="h-4 w-4" />
          {isEdit ? "Update Problem" : "Save Problem"}
        </Button>
      </div>
    </form>
  );
}
