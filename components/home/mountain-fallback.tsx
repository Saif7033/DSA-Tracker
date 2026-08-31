"use client";

import * as React from "react";
import { Code2, Sparkles } from "lucide-react";

export function MountainFallback() {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-full flex items-center justify-center overflow-hidden bg-slate-950 select-none">
      {/* Background Radial Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(37,99,235,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(14,165,233,0.12),transparent_70%)]" />

      {/* Decorative Star Dust */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Geometric Faceted Mountain SVG */}
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full max-w-[650px] max-h-[650px] relative z-10 drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for mountain facets */}
          <linearGradient id="facet-1" x1="400" y1="200" x2="200" y2="700" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="facet-2" x1="400" y1="200" x2="600" y2="700" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f172a" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="facet-3" x1="400" y1="200" x2="350" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#334155" stopOpacity="0.8" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="facet-highlight" x1="400" y1="200" x2="450" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a8a" stopOpacity="0.4" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="path-glow" x1="250" y1="700" x2="400" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="0.6" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Background Peaks */}
        <polygon points="120,700 280,360 440,700" fill="#090d16" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
        <polygon points="360,700 520,380 680,700" fill="#090d16" stroke="#1e293b" strokeWidth="1" opacity="0.6" />

        {/* Main Central Mountain Facets */}
        <polygon points="400,200 200,680 340,680" fill="url(#facet-1)" stroke="#334155" strokeWidth="1" />
        <polygon points="400,200 340,680 440,680" fill="url(#facet-3)" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" />
        <polygon points="400,200 440,680 600,680" fill="url(#facet-2)" stroke="#1e293b" strokeWidth="1" />
        <polygon points="400,200 400,680 480,680" fill="url(#facet-highlight)" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.4" />

        {/* Smaller Ridge Facets */}
        <polygon points="300,440 200,680 340,680" fill="#090d16" opacity="0.4" />
        <polygon points="500,440 600,680 440,680" fill="#090d16" opacity="0.6" />

        {/* Glowing Winding Summit Path */}
        <path
          d="M 230,680 Q 280,600 320,530 T 360,400 T 385,290 T 400,205"
          fill="none"
          stroke="url(#path-glow)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Floating Geometric Elements */}
        <polygon points="260,280 280,250 300,280 280,310" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
        <polygon points="540,320 565,290 590,320 565,350" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8" />
        <polygon points="490,210 505,190 520,210 505,230" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

        {/* Summit Beacon / Glowing Code Symbol */}
        <circle cx="400" cy="200" r="14" fill="#0284c7" fillOpacity="0.3" filter="url(#glow)" />
        <circle cx="400" cy="200" r="6" fill="#38bdf8" />
      </svg>

      {/* Summit Overlay Symbol */}
      <div className="absolute top-[24%] left-1/2 -translate-x-1/2 flex items-center gap-1 text-sky-300 font-mono text-xs tracking-widest px-3 py-1 rounded-full bg-slate-900/80 border border-sky-500/40 shadow-lg shadow-sky-500/20 backdrop-blur-sm z-20">
        <Code2 className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
        <span>MASTERY</span>
      </div>

      {/* Atmospheric bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}
