"use client";

import { Sparkles, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ClinicalSessionSummary,
  FormativeFeedbackSlot,
  ClinicalAiContentSlots,
} from "@/types/clinical-session-artifacts";

interface ClinicalSessionArtifactsProps {
  summary?: ClinicalSessionSummary | null;
  formativeFeedback?: FormativeFeedbackSlot | null;
  /** Ranuras reservadas para IA — se muestran solo si hay contenido */
  aiSlots?: ClinicalAiContentSlots;
  className?: string;
}

function AiReservedNote({ label }: { label: string }) {
  return (
    <p className="mt-3 rounded border border-dashed border-border/50 bg-muted/10 px-3 py-2 text-[10px] leading-snug text-muted-foreground/90">
      <Sparkles className="mr-1.5 inline h-3 w-3 text-primary/70" />
      {label}
    </p>
  );
}

export function ClinicalSessionArtifacts({
  summary,
  formativeFeedback,
  aiSlots,
  className,
}: ClinicalSessionArtifactsProps) {
  if (!summary && !formativeFeedback) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {summary && (
        <section className="rounded-lg border border-border/40 bg-card/70 px-4 py-3.5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {summary.title}
          </h3>
          <p className="mt-3 text-xs font-semibold text-foreground">
            Factores identificados
          </p>
          <ul className="mt-2 space-y-1">
            {summary.factorsIdentified.map((f) => (
              <li
                key={f}
                className="flex gap-2 text-xs leading-snug text-muted-foreground"
              >
                <span className="text-info">•</span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold text-foreground">
            Fortalezas observadas
          </p>
          <ul className="mt-2 space-y-1">
            {summary.strengthsObserved.map((s) => (
              <li
                key={s}
                className="flex gap-2 text-xs leading-snug text-muted-foreground"
              >
                <span className="text-success">•</span>
                {s}
              </li>
            ))}
          </ul>
          {summary.closingNote && (
            <p className="mt-3 text-[10px] italic text-muted-foreground/80">
              {summary.closingNote}
            </p>
          )}
          {!aiSlots?.sessionSummary && (
            <AiReservedNote label="Espacio preparado para resumen enriquecido por IA." />
          )}
        </section>
      )}

      {formativeFeedback && (
        <section className="rounded-lg border border-border/40 bg-primary/[0.04] px-4 py-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-primary" />
            {formativeFeedback.title}
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-foreground/90">
            {formativeFeedback.observation}
          </p>
          {formativeFeedback.teacherComment == null &&
            !aiSlots?.formativeFeedback?.teacherComment && (
              <AiReservedNote label="Espacio reservado para retroalimentación docente (sin calificación)." />
            )}
          {formativeFeedback.aiSuggestion == null &&
            !aiSlots?.pedagogicalSuggestions?.length && (
              <AiReservedNote label="Espacio reservado para sugerencias pedagógicas asistidas por IA." />
            )}
        </section>
      )}
    </div>
  );
}
