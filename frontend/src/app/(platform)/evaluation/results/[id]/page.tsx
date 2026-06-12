"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  Surface,
  SectionHeader,
  CompetencyRadar,
  PageLoading,
  InsightHighlight,
} from "@/components/design-system";
import { MetricsOverview } from "@/modules/evaluation/components/evaluation-cards";
import { useEvaluation, useGenerateAISummary } from "@/hooks/use-data";
import { ApiError } from "@/services/api-error";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface EvaluationResultPageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluationResultPage({ params }: EvaluationResultPageProps) {
  const { id } = use(params);
  const { data: result, isLoading } = useEvaluation(id);
  const attemptId = Number(id);
  const generateAISummary = useGenerateAISummary(attemptId, id);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const handleGenerateAISummary = () => {
    setAiNotice(null);
    generateAISummary.mutate(
      {},
      {
        onSuccess: (summary) => {
          if (!summary.fueExitosa) {
            setAiNotice(
              summary.mensajeError
                ? `Se generó una respuesta alternativa porque el proveedor IA no respondió correctamente: ${summary.mensajeError}`
                : "Se generó una respuesta alternativa porque el proveedor IA no respondió correctamente."
            );
            return;
          }
          setAiNotice("Resumen IA generado correctamente.");
        },
        onError: (error) => {
          setAiNotice(
            error instanceof ApiError
              ? error.message
              : "No se pudo generar el resumen IA. Intenta nuevamente."
          );
        },
      }
    );
  };

  if (isLoading) return <PageLoading />;

  if (!result) {
    return (
      <Surface variant="muted" className="py-16 text-center text-muted-foreground">
        Resultado no encontrado
      </Surface>
    );
  }

  const scoreVariant =
    result.score === null
      ? "outline"
      : result.score >= 80
        ? "success"
        : result.score >= 60
          ? "warning"
          : "destructive";

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/evaluation">
          <ArrowLeft className="h-4 w-4" />
          Volver a evaluaciones
        </Link>
      </Button>

      <HeroSection
        eyebrow="Retroalimentación clínica"
        title={result.caseTitle}
        description={`Completado el ${format(new Date(result.completedAt), "d 'de' MMMM, yyyy", { locale: es })} · ${result.studentName}`}
        aside={
          <InsightHighlight
            label="Puntuación clínica"
            value={result.score === null ? "N/D" : `${result.score}%`}
          />
        }
        action={
          <Badge variant={scoreVariant} className="px-4 py-1.5 text-sm">
            {result.score === null
              ? "Sin puntuación cuantitativa"
              : result.score >= 80
                ? "Desempeño destacado"
                : result.score >= 60
                  ? "En desarrollo"
                  : "Requiere refuerzo"}
          </Badge>
        }
      />

      {result.metrics.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CompetencyRadar metrics={result.metrics} />
        </div>
      )}

      <MetricsOverview metrics={result.metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHeader
            title="Fortalezas identificadas"
            description="Competencias clínicas observadas positivamente"
          />
          <ul className="mt-4 space-y-2.5">
            {result.strengths.length > 0 ? result.strengths.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                {s}
              </li>
            )) : (
              <li className="text-sm text-muted-foreground">
                Sin fortalezas estructuradas registradas por el backend.
              </li>
            )}
          </ul>
        </Surface>

        <Surface>
          <SectionHeader
            title="Áreas de mejora"
            description="Oportunidades formativas priorizadas"
          />
          <ul className="mt-4 space-y-2.5">
            {result.improvements.length > 0 ? result.improvements.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                {s}
              </li>
            )) : (
              <li className="text-sm text-muted-foreground">
                Sin áreas estructuradas registradas por el backend.
              </li>
            )}
          </ul>
        </Surface>
      </div>

      <Surface className="border-primary/15 bg-gradient-to-br from-primary/[0.04] to-card">
        <SectionHeader
          title="Observaciones del supervisor"
          description="Retroalimentación clínica contextualizada"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            disabled={generateAISummary.isPending || !Number.isFinite(attemptId)}
            onClick={handleGenerateAISummary}
          >
            <Sparkles className="h-4 w-4" />
            {generateAISummary.isPending ? "Generando resumen IA" : "Generar resumen IA"}
          </Button>
          {aiNotice && (
            <p
              className={`text-xs ${
                generateAISummary.isError || aiNotice.includes("alternativa")
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {aiNotice}
            </p>
          )}
          {generateAISummary.isError && !aiNotice && (
            <p className="text-xs text-destructive">
              No se pudo generar el resumen IA. Intenta nuevamente.
            </p>
          )}
        </div>
        <div className="mt-4 space-y-4">
          {result.feedback.map((fb, i) => (
            <p
              key={i}
              className="border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-muted-foreground"
            >
              {fb}
            </p>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-primary/[0.05] p-3 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-brand shrink-0" />
          Recomendación: revisa el expediente del caso y repite la simulación enfocándote en las áreas señaladas.
        </div>
      </Surface>
    </div>
  );
}
