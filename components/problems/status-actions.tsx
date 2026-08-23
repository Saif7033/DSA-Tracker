"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, HelpCircle, Trash2, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProblemStatusType } from "@/types/database.types";
import { updateProblemStatus, deleteProblem } from "@/lib/actions/problems";

interface StatusActionsProps {
  problemId: string;
  currentStatus: ProblemStatusType;
}

export function StatusActions({ problemId, currentStatus }: StatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState<ProblemStatusType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleStatusChange = async (newStatus: ProblemStatusType) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(newStatus);
    try {
      await updateProblemStatus(problemId, newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProblem(problemId);
      if (res.success) {
        setShowDeleteModal(false);
        router.push("/problems");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Mark Solved */}
        <Button
          variant={currentStatus === "Solved" ? "success" : "outline"}
          size="sm"
          className="text-xs h-9"
          isLoading={isUpdating === "Solved"}
          onClick={() => handleStatusChange("Solved")}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          {currentStatus === "Solved" ? "Solved ✓" : "Mark as Solved"}
        </Button>

        {/* Mark Attempted */}
        <Button
          variant={currentStatus === "Attempted" ? "secondary" : "outline"}
          size="sm"
          className="text-xs h-9"
          isLoading={isUpdating === "Attempted"}
          onClick={() => handleStatusChange("Attempted")}
        >
          <Clock className="h-3.5 w-3.5 mr-1" />
          {currentStatus === "Attempted" ? "Attempted" : "Mark as Attempted"}
        </Button>

        {/* Mark Unsolved */}
        <Button
          variant={currentStatus === "Unsolved" ? "secondary" : "outline"}
          size="sm"
          className="text-xs h-9"
          isLoading={isUpdating === "Unsolved"}
          onClick={() => handleStatusChange("Unsolved")}
        >
          <HelpCircle className="h-3.5 w-3.5 mr-1" />
          {currentStatus === "Unsolved" ? "Unsolved" : "Mark as Unsolved"}
        </Button>

        {/* Delete Trigger */}
        <Button
          variant="danger"
          size="sm"
          className="text-xs h-9 ml-auto"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Problem"
        description="Are you sure you want to permanently delete this problem and all its notes? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
