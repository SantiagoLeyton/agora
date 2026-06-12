"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection, PageLoading, Surface } from "@/components/design-system";
import { EvaluationCard } from "@/modules/evaluation/components/evaluation-cards";
import { AcademicProgressTimeline } from "@/modules/evaluation/components/academic-progress-timeline";
import { useEvaluations, useMyAcademicProgress } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function EvaluationHistoryPage() {
  const { data: evaluations, isLoading } = useEvaluations();
  const { data: progress, isLoading: progressLoading } = useMyAcademicProgress();
  const meta = getPageHeroMeta("/evaluation/history");

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/evaluation">
          <ArrowLeft className="h-4 w-4" />
          Volver a evaluaciones
        </Link>
      </Button>

      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      {progressLoading ? (
        <PageLoading />
      ) : progress ? (
        <AcademicProgressTimeline progress={progress} />
      ) : null}

      {isLoading ? (
        <PageLoading />
      ) : evaluations && evaluations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {evaluations.map((result, index) => (
            <EvaluationCard key={result.id} result={result} index={index} />
          ))}
        </div>
      ) : (
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          Aún no tienes evaluaciones registradas. Completa una simulación para ver tu historial.
        </Surface>
      )}
    </div>
  );
}
