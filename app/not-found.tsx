import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
      <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
        <FileQuestion className="h-8 w-8 text-blue-400" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        The problem or page you are looking for does not exist or might have been removed.
      </p>
      <Link href="/dashboard">
        <Button variant="primary" size="md">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
