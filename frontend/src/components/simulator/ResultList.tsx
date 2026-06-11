"use client";

import { cn } from "@/lib/utils";

interface ResultListProps {
  items: string[];
  variant?: "default" | "success" | "info" | "warning";
  className?: string;
}

const dotStyles = {
  default: "text-info",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
};

export function ResultList({ items, variant = "default", className }: ResultListProps) {
  if (items.length === 0) return null;

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2.5 text-sm leading-relaxed">
          <span className={cn("text-xs mt-1 shrink-0", dotStyles[variant])}>•</span>
          <span className="text-foreground/90">{item}</span>
        </li>
      ))}
    </ul>
  );
}
