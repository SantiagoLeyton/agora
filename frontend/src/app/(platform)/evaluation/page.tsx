"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  SectionHeader,
  Surface,
  InsightHighlight,
} from "@/components/design-system";
import { EvaluationCard, EvaluationOverview } from "@/modules/evaluation/components/evaluation-cards";
import { useEvaluations } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function EvaluationPage() {
  const { data: evaluations, isLoading } = useEvaluations();
  const meta = getPageHeroMeta("/evaluation");

  const scoredEvaluations = evaluations?.filter((e) => e.score !== null) ?? [];
  const avgScore =
    scoredEvaluations.length > 0
      ? (
          scoredEvaluations.reduce((s, e) => s + (e.score ?? 0), 0) /
          scoredEvaluations.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        tags={["Retroalimentación clínica", "Competencias"]}
        stats={
          evaluations && evaluations.length > 0
            ? [
                { label: "Evaluaciones", value: evaluations.length },
                {
                  label: "Promedio",
                  value: avgScore === null ? "Sin calificación" : `${avgScore} / 5`,
                },
                {
                  label: "Última",
                  value:
                    evaluations[0]?.score === null
                      ? "Sin calificación"
                      : `${evaluations[0]?.score?.toFixed(1)} / 5`,
                  hint: "Escala académica",
                },
              ]
            : undefined
        }
        aside={
          evaluations && evaluations.length > 0 ? (
            <InsightHighlight
              label="Promedio académico"
              value={avgScore === null ? "Sin calificación configurada" : `${avgScore} / 5`}
              sublabel={`${evaluations.length} evaluaciones`}
            />
          ) : undefined
        }
        action={
          <Button asChild variant="outline">
            <Link href="/evaluation/history">
              <History className="h-4 w-4" />
              Historial completo
            </Link>
          </Button>
        }
      />

      {!isLoading && evaluations && evaluations.length > 0 && (
        <EvaluationOverview evaluations={evaluations} />
      )}

      <SectionHeader
        title="Retroalimentación por simulación"
        description="Análisis clínico personalizado de cada sesión completada"
      />

      {isLoading ? (
        <Surface variant="muted" className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </Surface>
      ) : evaluations && evaluations.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {evaluations.map((result, index) => (
            <EvaluationCard key={result.id} result={result} index={index} />
          ))}
        </div>
      ) : (
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          Aún no tienes evaluaciones registradas. Completa una simulación para recibir retroalimentación.
        </Surface>
      )}
    </div>
  );
}
