"use client";

import { motion, useSpring, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { tokens } from "@/styles/tokens";

function AnimatedValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const spring = useSpring(0, { stiffness: 80, damping: 20 });

  useMotionValueEvent(spring, "change", (v) => setDisplay(Math.round(v)));
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <>{display}</>;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  index?: number;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  index = 0,
  className,
}: MetricCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const numericValue = typeof value === "number" ? value : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * tokens.motion.stagger, duration: 0.4, ease: tokens.motion.easeOut }}
      whileHover={{ y: -3, transition: { duration: tokens.motion.fast } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/55",
        "bg-gradient-to-br from-card to-muted/25",
        "p-5 shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--surface-ring))]",
        "transition-[box-shadow,border-color] duration-300",
        "hover:border-primary/20 hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/[0.05] transition-transform duration-500 group-hover:scale-110" />
      <div className="relative">
        {Icon && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {numericValue !== null ? <AnimatedValue value={numericValue} /> : value}
        </p>
        {change && (
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              trend === "up" && "text-success",
              trend === "down" && "text-warning",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {change}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function MetricGrid({
  stats,
  icons,
}: {
  stats: DashboardStat[];
  icons?: Record<string, LucideIcon>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <MetricCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          trend={stat.trend}
          icon={icons?.[stat.label]}
          index={index}
        />
      ))}
    </div>
  );
}
