"use client";

import { cn } from "@/lib/utils";

/** Formas orgánicas sutiles — identidad psicológica sin clichés */
export function HeroDecorations({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <svg
        className="absolute -right-4 top-8 h-32 w-32 text-primary/[0.07] sm:h-40 sm:w-40"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path
          d="M60 10 C90 25, 105 55, 95 85 C85 105, 55 115, 35 95 C15 75, 20 35, 60 10Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className="absolute bottom-6 left-[40%] h-24 w-24 text-info/[0.06]"
        viewBox="0 0 80 80"
        fill="none"
      >
        <ellipse cx="40" cy="40" rx="36" ry="28" fill="currentColor" />
      </svg>
      <div className="absolute right-[18%] top-[42%] h-2 w-2 rounded-full bg-primary/20" />
      <div className="absolute right-[28%] top-[55%] h-1.5 w-1.5 rounded-full bg-info/25" />
      <div className="absolute bottom-[30%] left-[12%] h-1.5 w-1.5 rounded-full bg-primary/15" />
    </div>
  );
}

export function SidebarAccent({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.06] to-transparent",
        className
      )}
      aria-hidden
    />
  );
}
