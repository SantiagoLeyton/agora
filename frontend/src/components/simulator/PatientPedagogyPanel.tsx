"use client";

import { motion } from "framer-motion";
import { Eye, Lightbulb, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PatientPedagogyContent } from "@/lib/clinical-pedagogy";
import { tokens } from "@/styles/tokens";

interface PatientPedagogyPanelProps {
  content: PatientPedagogyContent;
  compact?: boolean;
  className?: string;
}

export function PatientPedagogyPanel({
  content,
  compact,
  className,
}: PatientPedagogyPanelProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: tokens.motion.easeOut }}
      className={cn("space-y-3", className)}
    >
      <section>
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Eye className="h-3 w-3 shrink-0 text-info" />
          Observación clínica
        </p>
        <ul className="space-y-1">
          {content.observations.map((item) => (
            <li
              key={item}
              className="flex gap-1.5 text-[11px] leading-snug text-foreground/90"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-info/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Lightbulb className="h-3 w-3 shrink-0 text-primary" />
          Interpretación contextual
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {content.contextualInterpretation}
        </p>
      </section>

      <section>
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Activity className="h-3 w-3 shrink-0 text-warning" />
          Estados visibles
        </p>
        <div className={cn("space-y-2", compact && "space-y-1.5")}>
          {content.indicators.map((ind) => (
            <div
              key={ind.key}
              className="rounded-lg border border-border/40 bg-muted/15 px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-foreground">
                  {ind.label}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {ind.value}%
                </span>
              </div>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {ind.narrative}
              </p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
