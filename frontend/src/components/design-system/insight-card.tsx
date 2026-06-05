"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Surface } from "./surface";
import { tokens } from "@/styles/tokens";

interface InsightCardProps {
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "highlight";
  className?: string;
}

export function InsightCard({
  icon: Icon,
  title,
  children,
  footer,
  variant = "default",
  className,
}: InsightCardProps) {
  return (
    <Surface
      hover
      className={cn(
        "relative overflow-hidden",
        variant === "highlight" &&
          "border-primary/15 bg-gradient-to-br from-primary/[0.06] via-card to-muted/25",
        className
      )}
    >
      {variant === "highlight" && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/[0.06] blur-2xl" />
      )}
      <div className="relative flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
          {footer && <div className="mt-4">{footer}</div>}
        </div>
      </div>
    </Surface>
  );
}

interface InsightHighlightProps {
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}

export function InsightHighlight({ label, value, sublabel, className }: InsightHighlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: tokens.motion.base }}
      className={cn("ds-panel-subtle p-4 shadow-[var(--shadow-sm)]", className)}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {sublabel && <p className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</p>}
    </motion.div>
  );
}
