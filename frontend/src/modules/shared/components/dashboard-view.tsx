"use client";

import Link from "next/link";
import { ArrowRight, Brain, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  HeroSection,
  MetricGrid,
  Surface,
  SectionHeader,
  InsightCard,
  InsightHighlight,
  ClinicalInsights,
  CompetencyTracker,
} from "@/components/design-system";
import { mockDashboardStats, mockEvaluationResults } from "@/mocks";
import { useAuthStore } from "@/store";
import { getPersonalizedHeroTitle, getPageHeroMeta } from "@/lib/page-meta";
import { getMotivationalMessage } from "@/lib/greeting";
import { clinicalCopy, clinicalInsights, therapeuticCompetencies } from "@/lib/clinical-copy";
import { ContinueLearning } from "@/modules/student/components/continue-learning";

const metricIcons = {
  "Casos completados": Brain,
  "Promedio de evaluación": Target,
  "Tiempo de práctica": Clock,
  "Casos en progreso": Brain,
};

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "Participante";
  const latest = mockEvaluationResults[0];
  const meta = getPageHeroMeta("/dashboard");

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={getPersonalizedHeroTitle("student", firstName)}
        description={getMotivationalMessage()}
        tags={["Simulación inmersiva", "Análisis clínico"]}
        stats={[
          { label: "Expedientes", value: mockDashboardStats[0]?.value ?? 0 },
          { label: "Promedio clínico", value: `${mockDashboardStats[1]?.value ?? 0}%` },
          { label: "En curso", value: mockDashboardStats[3]?.value ?? 0, hint: "Sesiones activas" },
        ]}
        action={
          <>
            <Button asChild size="lg">
              <Link href="/simulator/case-anxiety-001/play">
                Continuar sesión
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/simulator">Explorar {clinicalCopy.cases.toLowerCase()}</Link>
            </Button>
          </>
        }
        aside={
          <div className="glass-surface space-y-3 p-4">
            <p className="text-xs font-medium text-muted-foreground">{clinicalCopy.progress} del semestre</p>
            <p className="font-display text-3xl font-semibold tabular-nums">68%</p>
            <Progress value={68} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Expediente activo: Ansiedad universitaria · 35%
            </p>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MetricGrid stats={mockDashboardStats} icons={metricIcons} />
        </div>
        <Surface variant="muted" padding="md">
          <ClinicalInsights insights={clinicalInsights.student} title="Insights de tu práctica" />
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContinueLearning />
        </div>
        <div className="lg:col-span-2">
          <InsightCard
            title={`Última ${clinicalCopy.feedback.toLowerCase()}`}
            variant="highlight"
            footer={
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/evaluation/results/${latest.id}`}>
                  Ver análisis completo
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            }
          >
            <p className="font-medium text-foreground">{latest.caseTitle}</p>
            <InsightHighlight label="Puntuación clínica" value={`${latest.score}%`} className="mt-3" />
            <p className="mt-3 text-sm">{latest.feedback[0]}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {latest.strengths.map((s) => (
                <span key={s} className="rounded-md bg-success/10 px-2 py-0.5 text-xs text-success">
                  {s}
                </span>
              ))}
            </div>
          </InsightCard>
        </div>
      </div>

      <CompetencyTracker competencies={therapeuticCompetencies} />
    </div>
  );
}
