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

  const avgScore =
    evaluations && evaluations.length > 0
      ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length)
      : 0;

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
                { label: "Promedio", value: `${avgScore}%` },
                { label: "Última", value: evaluations[0]?.score ?? 0, hint: "Puntuación %" },
              ]
            : undefined
        }
        aside={
          evaluations && evaluations.length > 0 ? (
            <InsightHighlight
              label="Promedio de competencias"
              value={`${avgScore}%`}
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
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {evaluations?.map((result, index) => (
            <EvaluationCard key={result.id} result={result} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
