"use client";

import Link from "next/link";
import { MessageSquare, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  SectionHeader,
  Surface,
} from "@/components/design-system";
import { RdaEvaluationPanel } from "@/modules/evaluation/components/rda-evaluation-panel";
import { ResultList } from "@/components/simulator/ResultList";
import { useAttemptConsequences, usePedagogicalAnalysis } from "@/hooks/use-data";
import { formatAcademicGrade } from "@/lib/evaluation-adapters";
import { resolveAiProviderLabel } from "@/lib/ai-provider";
import type { AttemptSummaryResponse, AISummaryHistoryResponse } from "@/types/simulation";
import { EmotionalRadarPanel } from "@/components/simulator/EmotionalRadarPanel";

interface AttemptFinalResultsProps {
  attemptId: number;
  summary?: AttemptSummaryResponse | null;
  aiSummaries?: AISummaryHistoryResponse | null;
}

export function AttemptFinalResults({
  attemptId,
  summary,
  aiSummaries,
}: AttemptFinalResultsProps) {
  const { data: analysis } = usePedagogicalAnalysis(attemptId);
  const { data: consequenceList } = useAttemptConsequences(attemptId);
  const latestAi = aiSummaries?.sintesis?.[0];
  const attempt = summary?.intento;
  const estados = analysis?.estadosFinales ?? summary?.estados ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <HeroSection
        eyebrow="Resultados finales"
        title="Retroalimentación integral de la simulación"
        description="Nota, estados emocionales, consecuencias acumuladas, feedback docente e IA basados en datos reales del intento."
        aside={
          attempt && (
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground">Calificación académica</p>
              <p className="font-display text-3xl font-semibold tabular-nums">
                {formatAcademicGrade(attempt)}
              </p>
            </div>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <EmotionalRadarPanel states={estados} />
        <Surface>
          <SectionHeader title="Consecuencias acumuladas" description="Efecto clínico de cada decisión" />
          <div className="mt-4 space-y-3">
            {(consequenceList?.consecuencias ?? analysis?.consecuenciasAcumuladas ?? []).length > 0 ? (
              (consequenceList?.consecuencias ?? analysis?.consecuenciasAcumuladas ?? []).map((item) => (
                <div key={item.respuestaId} className="rounded-xl border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">{item.pregunta}</p>
                  <p className="mt-1 text-sm font-medium">{item.mensaje ?? item.opcion}</p>
                  {item.observacionPedagogica && (
                    <p className="mt-2 text-xs text-muted-foreground">{item.observacionPedagogica}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin consecuencias registradas.</p>
            )}
          </div>
        </Surface>
      </div>

      {analysis && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Surface>
              <SectionHeader
                title="Retroalimentación clínica"
                description="Síntesis basada en decisiones y estados emocionales"
              />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {analysis.retroalimentacionClinica}
              </p>
            </Surface>
            <Surface>
              <SectionHeader
                title="Retroalimentación pedagógica"
                description="Observaciones formativas vinculadas a RDA"
              />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {analysis.retroalimentacionPedagogica}
              </p>
            </Surface>
          </div>

          <Surface>
            <SectionHeader title="Recomendaciones de mejora" />
            <ResultList items={analysis.recomendaciones} variant="info" />
          </Surface>

          <RdaEvaluationPanel
            items={[...(analysis.rdaAlcanzados ?? []), ...(analysis.rdaPendientes ?? [])]}
          />
        </>
      )}

      {summary?.retroalimentaciones?.length ? (
        <Surface>
          <SectionHeader title="Feedback docente" />
          <div className="mt-4 space-y-3">
            {summary.retroalimentaciones
              .filter((item) => item.autor === "DOCENTE")
              .map((item) => (
                <div key={item.id} className="border-l-2 border-primary/30 pl-4 text-sm">
                  <MessageSquare className="mb-1 inline h-4 w-4 text-primary" /> {item.contenido}
                </div>
              ))}
          </div>
        </Surface>
      ) : null}

      {latestAi && (
        <Surface className="border-primary/15">
          <div className="flex flex-wrap items-center gap-2">
            <SectionHeader title="Feedback IA" description="Análisis generado sobre el intento" />
            <Badge variant={latestAi.fueExitosa ? "success" : "warning"}>
              {resolveAiProviderLabel(latestAi)}
            </Badge>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {latestAi.respuestaGenerada}
          </p>
          {!latestAi.fueExitosa && latestAi.mensajeError && (
            <p className="mt-2 text-xs text-destructive">{latestAi.mensajeError}</p>
          )}
        </Surface>
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/simulator">Volver al repositorio</Link>
        </Button>
        <Button asChild>
          <Link href={`/evaluation/results/${attemptId}`}>
            <Brain className="h-4 w-4" />
            Ver evaluación completa
          </Link>
        </Button>
      </div>
    </div>
  );
}
