"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionPhaseStep } from "@/lib/clinical-session-phases";
import { tokens } from "@/styles/tokens";

interface ClinicalSessionPhaseTimelineProps {
  phases: SessionPhaseStep[];
  className?: string;
}

export function ClinicalSessionPhaseTimeline({
  phases,
  className,
}: ClinicalSessionPhaseTimelineProps) {
  return (
    <div className={cn("w-full", className)}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Línea temporal clínica
      </p>
      <div className="flex items-start gap-0 overflow-x-auto pb-0.5">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="flex min-w-0 flex-1 flex-col items-center"
          >
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={cn(
                    "h-px flex-1",
                    phase.status === "pending"
                      ? "bg-border/60"
                      : "bg-primary/40"
                  )}
                />
              )}
              <motion.div
                layout
                className={cn(
                  "relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold",
                  phase.status === "current" &&
                    "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]",
                  phase.status === "completed" &&
                    "border-primary/50 bg-primary/15 text-primary",
                  phase.status === "pending" &&
                    "border-border/60 bg-muted/30 text-muted-foreground"
                )}
              >
                {phase.status === "completed" ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : (
                  <span className="sr-only">{phase.label}</span>
                )}
              </motion.div>
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1",
                    phases[index + 1]?.status === "pending"
                      ? "bg-border/60"
                      : "bg-primary/40"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-1.5 max-w-[4.5rem] text-center text-[9px] leading-tight md:max-w-none md:text-[10px]",
                phase.status === "current" && "font-semibold text-primary",
                phase.status === "completed" && "text-foreground/80",
                phase.status === "pending" && "text-muted-foreground/70"
              )}
            >
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
