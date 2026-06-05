"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PatientPortraitSvg } from "@/components/simulator/patient-portrait-svg";
import { getPatientPortraitMeta } from "@/lib/patient-portraits";
import type { PatientExpression } from "@/lib/patient-expression";
import { cn } from "@/lib/utils";

interface ClinicalPatientPortraitProps {
  caseId: string;
  expression: PatientExpression;
  interactionNonce?: number;
  className?: string;
}

export function ClinicalPatientPortrait({
  caseId,
  expression,
  interactionNonce = 0,
  className,
}: ClinicalPatientPortraitProps) {
  const meta = getPatientPortraitMeta(caseId);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (interactionNonce === 0) return;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 700);
    return () => window.clearTimeout(t);
  }, [interactionNonce]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60",
        "bg-gradient-to-b from-muted/20 via-card to-card",
        "shadow-[var(--shadow-elevated)] ring-1 ring-[hsl(var(--surface-ring))]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-16 bg-gradient-to-b from-card/80 to-transparent" />

      <motion.div
        className="relative mx-auto aspect-[3/4] w-full max-w-[280px] px-4 pt-2 pb-1"
        animate={
          pulse
            ? { scale: [1, 1.02, 1], y: [0, -2, 0] }
            : { scale: [1, 1.008, 1], y: [0, -1, 0] }
        }
        transition={
          pulse
            ? { duration: 0.55, ease: "easeOut" }
            : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={expression}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="h-full w-full"
          >
            <PatientPortraitSvg variant={meta.variant} expression={expression} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="relative z-[2] border-t border-border/40 bg-card/90 px-4 py-3 backdrop-blur-sm">
        <p className="text-sm font-semibold text-foreground">{meta.displayName}</p>
        <p className="text-xs text-muted-foreground">
          {meta.age} años · {meta.context}
        </p>
      </div>
    </div>
  );
}
