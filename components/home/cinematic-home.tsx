"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { HomeLoginForm } from "./home-login-form";
import { MountainFallback } from "./mountain-fallback";

// Lazy-load Three.js 3D Mountain Scene with zero SSR overhead
const MountainScene = dynamic(
  () => import("./mountain-scene").then((mod) => mod.MountainScene),
  {
    ssr: false,
    loading: () => <MountainFallback />,
  }
);

export function CinematicHome() {
  const [sceneFailed, setSceneFailed] = React.useState(false);

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden">
      {/* Subtle Background Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      {/* Left Panel: Primary Authentication Experience */}
      <div className="relative z-20 w-full lg:w-[46%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-r border-slate-800/40 bg-slate-950/80 backdrop-blur-md">
        {/* Top Spacer / Mini Brand */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-slate-500 tracking-wider uppercase">
            Personal Problem Solving Suite
          </div>
        </div>

        {/* Center: Login Panel */}
        <div className="my-auto py-8">
          <React.Suspense
            fallback={
              <div className="py-12 text-center text-xs text-slate-500">
                Loading sign in...
              </div>
            }
          >
            <HomeLoginForm />
          </React.Suspense>
        </div>

        {/* Bottom Footer */}
        <div className="text-xs text-slate-500 flex items-center justify-between pt-4 border-t border-slate-900">
          <span>DSA Tracker &copy; {new Date().getFullYear()}</span>
          <span className="font-mono text-[11px] text-slate-600">v2.0 • Production</span>
        </div>
      </div>

      {/* Right Panel: Real 3D Mountain Environment */}
      <div className="relative z-10 w-full lg:w-[54%] xl:w-[58%] min-h-[420px] lg:min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        {sceneFailed ? (
          <MountainFallback />
        ) : (
          <MountainScene onError={() => setSceneFailed(true)} />
        )}
      </div>
    </div>
  );
}
