"use client";

import { cn } from "@/lib/utils";
import { FloatingBlobs } from "./floating-blobs";

/**
 * Atmósfera premium — slate / blue / indigo muy suave + grain + blobs animados
 */
export function AtmosphereBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      {/* Gradiente base clínico-tecnológico */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-50/70 dark:from-background dark:via-muted/20 dark:to-background" />

      <FloatingBlobs />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,hsl(var(--primary)/0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,hsl(199_80%_60%/0.04),transparent_50%)] dark:bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,hsl(199_60%_50%/0.06),transparent_50%)]" />

      {/* Grain / noise */}
      <div
        className="absolute inset-0 opacity-[0.4] mix-blend-soft-light dark:opacity-[0.25] dark:mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.015] dark:opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="ds-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ds-grid)" />
      </svg>
    </div>
  );
}
