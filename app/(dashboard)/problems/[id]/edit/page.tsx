import * as React from "react";
import { notFound } from "next/navigation";
import { ProblemForm } from "@/components/problems/problem-form";
import { getProblemById } from "@/lib/actions/problems";

export const dynamic = "force-dynamic";

interface EditProblemPageProps {
  params: {
    id: string;
  };
}

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const problem = await getProblemById(params.id);

  if (!problem) {
    notFound();
  }

  return <ProblemForm initialData={problem} isEdit={true} />;
}
