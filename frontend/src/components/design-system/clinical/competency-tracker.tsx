"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { tokens } from "@/styles/tokens";

interface Competency {
  id: string;
  label: string;
  value: number;
  level: string;
}

interface CompetencyTrackerProps {
  competencies: readonly Competency[] | Competency[];
  className?: string;
}

export function CompetencyTracker({ competencies, className }: CompetencyTrackerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/55 bg-gradient-to-br from-card to-muted/25 p-5 shadow-[var(--shadow-card)] ring-1 ring-[hsl(var(--surface-ring))]",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Award className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Competencias terapéuticas</h3>
          <p className="text-[11px] text-muted-foreground">Progreso formativo del semestre</p>
        </div>
      </div>
      <div className="space-y-4">
        {competencies.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * tokens.motion.stagger }}
            className="group"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{c.label}</span>
              <Badge
                variant="outline"
                className="border-primary/15 bg-primary/[0.06] text-[9px] font-normal text-primary"
              >
                {c.level}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={c.value} className="h-1.5 flex-1" />
              <span className="w-9 text-right text-xs font-semibold tabular-nums text-foreground">
                {c.value}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
