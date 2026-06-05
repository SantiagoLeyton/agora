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
  CompetencyTrend,
  PageLoading,
  InsightHighlight,
} from "@/components/design-system";
import { MetricsOverview } from "@/modules/evaluation/components/evaluation-cards";
import { useEvaluation } from "@/hooks/use-data";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const trendMock = [
  { label: "Ene", value: 62 },
  { label: "Feb", value: 68 },
  { label: "Mar", value: 71 },
  { label: "Abr", value: 74 },
  { label: "May", value: 78 },
];

interface EvaluationResultPageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluationResultPage({ params }: EvaluationResultPageProps) {
  const { id } = use(params);
  const { data: result, isLoading } = useEvaluation(id);

  if (isLoading) return <PageLoading />;

  if (!result) {
    return (
      <Surface variant="muted" className="py-16 text-center text-muted-foreground">
        Resultado no encontrado
      </Surface>
    );
  }

  const scoreVariant =
    result.score >= 80 ? "success" : result.score >= 60 ? "warning" : "destructive";

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
          <InsightHighlight label="Puntuación clínica" value={`${result.score}%`} />
        }
        action={
          <Badge variant={scoreVariant} className="px-4 py-1.5 text-sm">
            {result.score >= 80 ? "Desempeño destacado" : result.score >= 60 ? "En desarrollo" : "Requiere refuerzo"}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CompetencyRadar metrics={result.metrics} />
        <CompetencyTrend data={trendMock} />
      </div>

      <MetricsOverview metrics={result.metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHeader
            title="Fortalezas identificadas"
            description="Competencias clínicas observadas positivamente"
          />
          <ul className="mt-4 space-y-2.5">
            {result.strengths.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                {s}
              </li>
            ))}
          </ul>
        </Surface>

        <Surface>
          <SectionHeader
            title="Áreas de mejora"
            description="Oportunidades formativas priorizadas"
          />
          <ul className="mt-4 space-y-2.5">
            {result.improvements.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                {s}
              </li>
            ))}
          </ul>
        </Surface>
      </div>

      <Surface className="border-primary/15 bg-gradient-to-br from-primary/[0.04] to-card">
        <SectionHeader
          title="Observaciones del supervisor"
          description="Retroalimentación clínica contextualizada"
        />
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
