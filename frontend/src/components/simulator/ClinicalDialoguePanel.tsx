"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ClinicalDialogueTurn } from "@/lib/clinical-dialogue";
import type { SessionPhaseStep } from "@/lib/clinical-session-phases";
import { ClinicalSessionPhaseTimeline } from "@/components/simulator/ClinicalSessionPhaseTimeline";
import { tokens } from "@/styles/tokens";

interface ClinicalDialoguePanelProps {
  turns: ClinicalDialogueTurn[];
  setting?: string;
  sceneTitle?: string;
  sessionPhases?: SessionPhaseStep[];
  className?: string;
}

function ImpactObserved({
  deltas,
}: {
  deltas: NonNullable<ClinicalDialogueTurn["impactDeltas"]>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: tokens.motion.easeOut }}
      className="mt-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Impacto observado
      </p>
      <div className="flex flex-wrap gap-2">
        {deltas.map((d) => (
          <span
            key={d.label}
            className={cn(
              "rounded-md border border-border/50 bg-card/80 px-2 py-1 font-mono text-[11px] tabular-nums",
              d.delta > 0
                ? "text-success"
                : d.delta < 0
                  ? "text-warning"
                  : "text-muted-foreground"
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function ClinicalDialoguePanel({
  turns,
  setting,
  sceneTitle,
  sessionPhases,
  className,
}: ClinicalDialoguePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden bg-card/20",
        className
      )}
    >
      <header className="shrink-0 space-y-2.5 border-b border-border/30 px-4 py-2.5">
        {sessionPhases && sessionPhases.length > 0 && (
          <ClinicalSessionPhaseTimeline phases={sessionPhases} />
        )}
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight md:text-lg">
            Conversación clínica
          </h2>
          {(setting || sceneTitle) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {[setting, sceneTitle].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-5 md:py-5"
      >
        <div className="w-full space-y-0">
          <AnimatePresence initial={false}>
            {turns.length === 0 ? (
              <p className="py-16 text-center text-sm leading-relaxed text-muted-foreground">
                El paciente abrirá la entrevista. Escucha su relato y registra tu
                intervención en el panel derecho.
              </p>
            ) : (
              turns.map((turn, index) => {
                const isPsychologist = turn.role === "psychologist";
                const isLast = index === turns.length - 1;

                return (
                  <motion.div
                    key={turn.id}
                    initial={{
                      opacity: 0,
                      y: isPsychologist ? 8 : 10,
                      x: isPsychologist ? -6 : 6,
                    }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      duration: isLast ? 0.45 : 0.32,
                      ease: tokens.motion.easeOut,
                    }}
                    className={cn(
                      "border-b border-border/25 py-4 md:py-5",
                      isLast && "border-b-0 bg-muted/[0.03]",
                      isPsychologist ? "pl-0" : "pr-0"
                    )}
                  >
                    <p
                      className={cn(
                        "mb-2 text-xs font-bold uppercase tracking-[0.14em]",
                        isPsychologist ? "text-primary" : "text-info"
                      )}
                    >
                      {isPsychologist ? "Psicólogo" : "Paciente"}
                      <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                        — {turn.speakerName}
                      </span>
                    </p>
                    <p className="text-[15px] leading-[1.8] text-foreground md:text-base md:leading-[1.85]">
                      {turn.text}
                    </p>
                    {turn.impactDeltas && turn.impactDeltas.length > 0 && (
                      <ImpactObserved deltas={turn.impactDeltas} />
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
