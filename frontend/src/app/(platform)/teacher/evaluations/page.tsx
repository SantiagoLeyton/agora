"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection, PageLoading } from "@/components/design-system";
import { EvaluationCard } from "@/modules/evaluation/components/evaluation-cards";
import { useEvaluations } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function TeacherEvaluationsPage() {
  const { data: evaluations, isLoading } = useEvaluations();
  const meta = getPageHeroMeta("/teacher/evaluations");

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      {isLoading ? (
        <PageLoading />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {evaluations?.map((result, index) => (
              <EvaluationCard key={result.id} result={result} index={index} />
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/teacher/metrics">
                Ver métricas agregadas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
