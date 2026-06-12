"use client";

import { motion } from "framer-motion";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/utils";
import { ResultCard } from "./ResultCard";
import { ResultList } from "./ResultList";
import type {
  ClinicalSessionSummary,
  FormativeFeedbackSlot,
} from "@/types/clinical-session-artifacts";
import type { ClinicalImpactDelta } from "@/lib/clinical-impact";
import { AlertCircle, Zap, Target, Lightbulb, BookOpen } from "lucide-react";

interface SimulationResultsProps {
  summary?: ClinicalSessionSummary | null;
  formativeFeedback?: FormativeFeedbackSlot | null;
  lastImpact?: ClinicalImpactDelta[];
  className?: string;
}

export function SimulationResults({
  summary,
  formativeFeedback,
  lastImpact,
  className,
}: SimulationResultsProps) {
  if (!summary && !formativeFeedback && (!lastImpact || lastImpact.length === 0)) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  // Separar impactos positivos y negativos
  const positiveImpacts = lastImpact?.filter((i) => i.delta > 0) ?? [];
  const negativeImpacts = lastImpact?.filter((i) => i.delta < 0) ?? [];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12",
        className
      )}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: tokens.motion.easeOut }}
        className="mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Resultados de la simulación
        </h2>
        <p className="text-muted-foreground">
          Análisis detallado del desempeño clínico, fortalezas identificadas y oportunidades de mejora
        </p>
      </motion.div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 gap-6">
        {/* Resumen clínico */}
        {summary && (
          <ResultCard
            title="Resumen clínico"
            variant="default"
            index={0}
          >
            <div className="space-y-4">
              {summary.factorsIdentified.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2.5">
                    Factores identificados
                  </p>
                  <ResultList items={summary.factorsIdentified} variant="info" />
                </div>
              )}

              {summary.strengthsObserved.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2.5">
                    Fortalezas observadas
                  </p>
                  <ResultList items={summary.strengthsObserved} variant="success" />
                </div>
              )}

              {summary.closingNote && (
                <div className="pt-2 mt-3 border-t border-border/30">
                  <p className="mt-3 p-3 rounded bg-muted/30 border border-border/30 text-xs italic text-muted-foreground/80 leading-relaxed">
                    &ldquo;{summary.closingNote}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </ResultCard>
        )}

        {/* Impactos positivos */}
        {positiveImpacts.length > 0 && (
          <ResultCard
            title="Cambios positivos observados"
            variant="success"
            index={summary ? 1 : 0}
          >
            <div className="flex flex-wrap gap-2">
              {positiveImpacts.map((impact) => (
                <motion.div
                  key={impact.label}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-success/30 bg-success/[0.08] text-success"
                >
                  <Zap className="h-3 w-3" />
                  <span>{impact.label}</span>
                  <span className="font-semibold ml-0.5">+{impact.delta}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border/30">
              Estos cambios indican progreso en la alianza terapéutica y el bienestar del paciente.
            </p>
          </ResultCard>
        )}

        {/* Impactos negativos / áreas de mejora */}
        {negativeImpacts.length > 0 && (
          <ResultCard
            title="Áreas de mejora"
            variant="warning"
            index={summary ? (positiveImpacts.length > 0 ? 2 : 1) : (positiveImpacts.length > 0 ? 1 : 0)}
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {negativeImpacts.map((impact) => (
                <motion.div
                  key={impact.label}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-warning/30 bg-warning/[0.08] text-warning"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{impact.label}</span>
                  <span className="font-semibold ml-0.5">{impact.delta}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70 pt-2 border-t border-border/30">
              Estas métricas sugieren aspectos donde se puede refinar la aproximación clínica en futuras sesiones.
            </p>
          </ResultCard>
        )}

        {/* Retroalimentación formativa */}
        {formativeFeedback && (
          <ResultCard
            title="Retroalimentación pedagógica"
            variant="info"
            index={3}
          >
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-foreground/90">
                {formativeFeedback.observation}
              </p>

              {formativeFeedback.teacherComment && (
                <motion.div
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 rounded border border-border/40 bg-muted/20"
                >
                  <p className="text-xs font-semibold text-muted-foreground/80 mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Comentario del docente
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {formativeFeedback.teacherComment}
                  </p>
                </motion.div>
              )}

              {formativeFeedback.aiSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 rounded border border-primary/20 bg-primary/[0.04]"
                >
                  <p className="text-xs font-semibold text-primary/80 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Sugerencia asistida por IA
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {formativeFeedback.aiSuggestion}
                  </p>
                </motion.div>
              )}
            </div>
          </ResultCard>
        )}
      </div>

      {/* Sección de orientación */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-lg border border-border/40 bg-muted/30"
      >
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Próximos pasos
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          <li>• Revisa las áreas de mejora identificadas antes de tu próxima sesión</li>
          <li>• Consulta el análisis completo en la sección de evaluación para más detalles</li>
          <li>• Practica con casos similares para fortalecer tus competencias clínicas</li>
        </ul>
      </motion.div>
    </motion.section>
  );
}
