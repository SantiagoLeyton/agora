"use client";

import { Surface } from "./surface";
import { cn } from "@/lib/utils";

export function PageLoading({ className }: { className?: string }) {
  return (
    <Surface
      variant="muted"
      className={cn("flex h-64 items-center justify-center", className)}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </Surface>
  );
}
