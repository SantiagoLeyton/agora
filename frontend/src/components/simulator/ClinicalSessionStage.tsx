"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/branding";
import { PSYCHOLOGIST_STATE_LABELS } from "@/lib/session-participants";
import { getTherapeuticAlliancePhase } from "@/lib/therapeutic-alliance";
import { ClinicalObjectiveCard } from "@/components/simulator/ClinicalObjectiveCard";
import { tokens } from "@/styles/tokens";
import type { PsychologistVisualState, SessionParticipant } from "@/types";

const ClinicalConsultationAvatars = dynamic(
  () =>
    import("@/components/simulator/ClinicalConsultationAvatars").then(
      (m) => m.ClinicalConsultationAvatars
    ),
  { ssr: false }
);

interface ClinicalSessionStageProps {
  psychologist: SessionParticipant;
  patient: SessionParticipant;
  psychologistExpression: string;
  patientExpression: string;
  therapeuticAlliance: number;
  clinicalObjective?: string;
  clinicalObjectivePhase?: string;
  patientInteractionNonce?: number;
  className?: string;
}

function ParticipantMeta({
  participant,
  stateLabel,
  tone,
  align,
}: {
  participant: SessionParticipant;
  stateLabel: string;
  tone: "primary" | "info";
  align: "left" | "right";
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: tokens.motion.easeOut }}
      className={cn(
        "flex flex-col gap-0.5",
        align === "right" ? "items-end text-right" : "items-start text-left"
      )}
    >
      <p className="text-sm font-semibold tracking-tight text-foreground">
        {participant.nombre}
      </p>
      <p className="text-[11px] text-muted-foreground">{participant.rol}</p>
      <motion.span
        layout
        className={cn(
          "mt-1.5 inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
          tone === "primary"
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-info/30 bg-info/10 text-info"
        )}
      >
        <span className="truncate">{stateLabel}</span>
      </motion.span>
    </motion.div>
  );
}

function AllianceCenter({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const phase = getTherapeuticAlliancePhase(pct);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: [1, 1.012, 1] }}
      transition={{
        opacity: { duration: 0.45, ease: tokens.motion.easeOut },
        scale: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
      }}
      className="flex w-[min(100%,12rem)] flex-col items-center rounded-2xl border border-border/50 bg-card/85 px-4 py-3 shadow-[var(--shadow-md)] backdrop-blur-md md:w-52"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Alianza terapéutica
      </span>
      <motion.p
        key={pct}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground"
      >
        {pct}%
      </motion.p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-info"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.65, ease: tokens.motion.easeOut }}
        />
      </div>
      <motion.p
        key={phase.levelLabel}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-center text-xs font-semibold text-foreground"
      >
        {phase.levelLabel}
      </motion.p>
      <p className="mt-1 text-center text-[10px] leading-snug text-muted-foreground">
        {phase.dynamicDescription}
      </p>
    </motion.div>
  );
}

export function ClinicalSessionStage({
  psychologist,
  patient,
  psychologistExpression,
  patientExpression,
  therapeuticAlliance,
  clinicalObjective,
  clinicalObjectivePhase,
  patientInteractionNonce = 0,
  className,
}: ClinicalSessionStageProps) {
  const psychState = psychologist.estadoVisual as PsychologistVisualState;
  const psychStateLabel =
    PSYCHOLOGIST_STATE_LABELS[psychState] ?? String(psychologist.estadoVisual);
  const patientStateLabel = String(patient.estadoVisual);

  const expressionKey = `${psychologistExpression}-${patientExpression}-${patientInteractionNonce}`;

  return (
    <motion.section
      layout
      className={cn(
        "relative flex min-h-[min(44vh,460px)] shrink-0 flex-col overflow-hidden border-b border-border/40",
        className
      )}
    >
      {/* Ambiente suave alrededor de la escena */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/30 via-background/80 to-background"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Encabezados de la escena */}
        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-end gap-2 px-4 pb-1 pt-3 md:px-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Psicólogo
          </span>
          <span className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Alianza
          </span>
          <span className="text-right text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Paciente
          </span>
        </div>

        {/* Zona compartida: avatares + alianza centrada */}
        <div className="relative mx-3 min-h-0 flex-1 md:mx-6">
          <div
            className={cn(
              "relative h-full min-h-[min(34vh,360px)] overflow-hidden rounded-2xl",
              "border border-border/30 shadow-[inset_0_1px_0_hsl(var(--border)/0.4)]",
              "bg-background/20"
            )}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
              <Image
                src={BRAND.consultationScene}
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width:768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-background/15" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-background/10 to-background/25" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_50%_at_50%_45%,hsl(var(--background)/0.5),transparent_72%)]" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={expressionKey}
                className="absolute inset-0 z-[1]"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.88 }}
                transition={{ duration: 0.4, ease: tokens.motion.easeOut }}
              >
                <div className="h-full w-full">
                  <ClinicalConsultationAvatars
                    psychologistModelId={psychologist.modelId}
                    patientModelId={patient.modelId}
                    psychologistExpression={psychologistExpression}
                    patientExpression={patientExpression}
                    interactionNonce={patientInteractionNonce}
                    className="h-full min-h-[min(34vh,360px)] w-full"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Viñetas suaves — integrar personajes con el consultorio */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[12%] max-w-[80px] bg-gradient-to-r from-background/25 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[12%] max-w-[80px] bg-gradient-to-l from-background/25 to-transparent"
              aria-hidden
            />

            <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col items-center justify-center gap-2 px-2">
              <AllianceCenter value={therapeuticAlliance} />
              {clinicalObjective && (
                <ClinicalObjectiveCard
                  objective={clinicalObjective}
                  phaseLabel={clinicalObjectivePhase}
                />
              )}
            </div>
          </div>
        </div>

        {/* Metadatos debajo de cada personaje */}
        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-start gap-3 px-4 pb-4 pt-3 md:px-8 md:pb-5">
          <ParticipantMeta
            participant={psychologist}
            stateLabel={psychStateLabel}
            tone="primary"
            align="left"
          />
          <div className="hidden w-48 md:block" aria-hidden />
          <ParticipantMeta
            participant={patient}
            stateLabel={patientStateLabel}
            tone="info"
            align="right"
          />
        </div>
      </div>
    </motion.section>
  );
}
