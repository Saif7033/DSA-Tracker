"use client";

import * as React from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  email?: string | null;
}

export function UserMenu({ email }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-200 truncate">
            {email || "User"}
          </p>
          <p className="text-[11px] text-slate-500">Personal Account</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 shrink-0"
        title="Sign out"
        isLoading={isLoggingOut}
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
