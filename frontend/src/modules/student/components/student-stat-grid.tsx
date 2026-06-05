"use client";

import { motion } from "framer-motion";
import { Brain, Clock, TrendingUp, Award, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types";

const iconByLabel: Record<string, LucideIcon> = {
  "Casos completados": Brain,
  "Promedio de evaluación": Award,
  "Tiempo de práctica": Clock,
  "Casos en progreso": TrendingUp,
};

interface StudentStatGridProps {
  stats: DashboardStat[];
}

export function StudentStatGrid({ stats }: StudentStatGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = iconByLabel[stat.label] ?? TrendingUp;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}
            whileHover={{ y: -2 }}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/70 bg-card p-5",
              "shadow-sm transition-shadow duration-300 hover:shadow-md hover:border-primary/15"
            )}
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/[0.04] transition-transform duration-300 group-hover:scale-110" />
            <div className="relative">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
              {stat.change && (
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    stat.trend === "up" && "text-success",
                    stat.trend === "down" && "text-warning",
                    stat.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {stat.change}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
