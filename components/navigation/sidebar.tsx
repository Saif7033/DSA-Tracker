"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, PlusCircle, Code2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

interface SidebarProps {
  userEmail?: string | null;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "All Problems",
      href: "/problems",
      icon: ListTodo,
      current: pathname === "/problems" || (pathname.startsWith("/problems/") && !pathname.includes("/new")),
    },
    {
      name: "Add Problem",
      href: "/problems/new",
      icon: PlusCircle,
      current: pathname === "/problems/new",
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-950 border-r border-slate-800/80 z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Code2 className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            DSA Tracker
            <Sparkles className="h-3 w-3 text-blue-400" />
          </span>
          <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
            Mastery Suite
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  item.current
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", item.current ? "text-blue-400" : "text-slate-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="pt-4 mt-auto">
          <UserMenu email={userEmail} />
        </div>
      </div>
    </aside>
  );
}
