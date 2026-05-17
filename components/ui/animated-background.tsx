"use client";

import { cn } from "@/lib/utils";
import React from "react";

/**
 * AuroraBackground — wraps content with an animated aurora borealis effect.
 * Designed for dark backgrounds; the aurora layer is hidden in light mode.
 *
 * Usage:
 *   <AuroraBackground className="min-h-screen">
 *     <YourHeroContent />
 *   </AuroraBackground>
 */
export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: {
  children?: React.ReactNode;
  className?: string;
  /** Fade the aurora at the edges with a radial mask (default: true) */
  showRadialGradient?: boolean;
}) {
  return (
    <div className={cn("relative isolate", className)}>
      {/* ── Aurora layer ───────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className={cn(
          // Base layer — repeating gradient that slides via animate-aurora
          "pointer-events-none absolute inset-0 overflow-hidden",
          "hidden dark:block", // only visible in dark mode
        )}
      >
        {/* Bottom stripe — slow, wide spread */}
        <div
          className={cn(
            "absolute inset-0 opacity-30",
            "animate-aurora",
            "[background-image:repeating-linear-gradient(100deg,#3b82f6_0%,#818cf8_12%,#a78bfa_24%,#67e8f9_36%,#60a5fa_48%,#3b82f6_60%)]",
            "[background-size:300%_200%]",
            "blur-[70px]",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,black_50%,transparent_100%)]",
          )}
        />

        {/* Top stripe — slightly faster, offset phase */}
        <div
          className={cn(
            "absolute inset-0 opacity-20",
            "animate-aurora-slow",
            "[background-image:repeating-linear-gradient(105deg,#6366f1_0%,#8b5cf6_15%,#06b6d4_30%,#3b82f6_45%,#a78bfa_60%,#6366f1_75%)]",
            "[background-size:250%_180%]",
            "blur-[90px]",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_70%_45%_at_50%_10%,black_30%,transparent_100%)]",
          )}
        />
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
