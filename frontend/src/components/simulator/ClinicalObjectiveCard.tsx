"use client";

import { Target } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";

interface ClinicalObjectiveCardProps {
  objective: string;
  phaseLabel?: string;
  className?: string;
}

export function ClinicalObjectiveCard({
  objective,
  phaseLabel,
  className,
}: ClinicalObjectiveCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: tokens.motion.easeOut }}
      className={cn(
        "w-[min(100%,16rem)] rounded-xl border border-border/50 bg-card/90 px-3 py-2.5 shadow-[var(--shadow-sm)] backdrop-blur-md md:w-56",
        className
      )}
    >
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Target className="h-3 w-3 shrink-0 text-primary" />
        Objetivo clínico actual
      </p>
      {phaseLabel && (
        <p className="mt-1 text-[10px] font-medium text-primary/90">{phaseLabel}</p>
      )}
      <p className="mt-1 text-[10px] leading-snug text-foreground/90">{objective}</p>
    </motion.div>
  );
}
