"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Code2, LayoutDashboard, ListTodo, PlusCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userEmail?: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Problems", href: "/problems", icon: ListTodo },
    { name: "Add Problem", href: "/problems/new", icon: PlusCircle },
  ];

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Code2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-white">DSA Tracker</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/problems/new">
            <Button size="sm" variant="primary" className="h-8 text-xs gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              Add
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="border-b border-slate-800 bg-slate-950 p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="px-2 py-1 text-xs text-slate-400 truncate">
            Signed in as <span className="text-white font-medium">{userEmail || "User"}</span>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                    active
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-slate-800">
            <form action={logoutAction}>
              <Button variant="danger" size="sm" className="w-full justify-center gap-2 text-xs">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
