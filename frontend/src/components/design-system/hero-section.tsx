"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";
import { HeroDecorations } from "./decorative-shapes";
import { Badge } from "@/components/ui/badge";

export interface HeroStat {
  label: string;
  value: string | number;
  hint?: string;
}

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  aside?: React.ReactNode;
  stats?: HeroStat[];
  tags?: string[];
  className?: string;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  action,
  aside,
  stats,
  tags,
  className,
}: HeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: tokens.motion.slow, ease: tokens.motion.easeOut }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/10",
        "bg-gradient-to-br from-card via-card to-muted/35",
        "shadow-[var(--shadow-card)] ring-1 ring-[hsl(var(--surface-ring))]",
        "p-6 sm:p-8 lg:p-9",
        className
      )}
    >
      <HeroDecorations />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,hsl(var(--primary)/0.07),transparent_50%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-info/[0.04] blur-3xl" />

      <div
        className={cn(
          "relative grid gap-6",
          aside && "lg:grid-cols-[1fr,minmax(260px,340px)] lg:items-start lg:gap-8"
        )}
      >
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {eyebrow && (
              <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1 text-xs font-semibold tracking-wide text-primary shadow-[var(--shadow-sm)]">
                {eyebrow}
              </span>
            )}
            {tags?.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-border/60 bg-muted/40 text-[10px] font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] lg:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              {description}
            </p>
          )}

          {stats && stats.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="ds-panel-subtle px-3 py-2.5 shadow-[var(--shadow-sm)]"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </p>
                  {stat.hint && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{stat.hint}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {action && <div className="mt-6 flex flex-wrap gap-3">{action}</div>}
        </div>

        {aside && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: tokens.motion.base }}
            className="relative"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
