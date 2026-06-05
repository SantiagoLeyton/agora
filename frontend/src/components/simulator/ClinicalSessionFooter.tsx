"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ClinicalImpactDelta } from "@/lib/clinical-impact";

interface ClinicalSessionFooterProps {
  expressionLabel: string;
  psychologistStateLabel: string;
  lastImpact?: ClinicalImpactDelta[];
  isComplete?: boolean;
  className?: string;
}

export function ClinicalSessionFooter({
  expressionLabel,
  psychologistStateLabel,
  lastImpact,
  isComplete,
  className,
}: ClinicalSessionFooterProps) {
  return (
    <motion.footer
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/40 bg-muted/10 px-3 py-2",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 text-[11px]">
        <span className="text-muted-foreground">
          Estado profesional:{" "}
          <span className="font-medium text-primary">{psychologistStateLabel}</span>
        </span>
        <span className="hidden text-border sm:inline">|</span>
        <span className="text-muted-foreground">
          Paciente:{" "}
          <span className="font-medium text-info">{expressionLabel}</span>
        </span>
      </div>

      {lastImpact && lastImpact.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lastImpact.map((d) => (
            <span
              key={d.label}
              className={cn(
                "rounded-md border border-border/40 bg-card/80 px-2 py-0.5 font-mono text-[10px] tabular-nums",
                d.delta > 0 ? "text-success" : "text-warning"
              )}
            >
              {d.label}
            </span>
          ))}
        </div>
      )}

      {isComplete && (
        <span className="text-[11px] font-medium text-success">Sesión finalizada</span>
      )}
    </motion.footer>
  );
}
