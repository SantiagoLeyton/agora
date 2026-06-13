"use client";

import Link from "next/link";
import { ArrowRight, Brain, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  MetricGrid,
  Surface,
  InsightCard,
  InsightHighlight,
} from "@/components/design-system";
import { useAuthStore } from "@/store";
import { useAttempts, useEvaluations } from "@/hooks/use-data";
import { getPersonalizedHeroTitle, getPageHeroMeta } from "@/lib/page-meta";
import { getMotivationalMessage } from "@/lib/greeting";
import { clinicalCopy } from "@/lib/clinical-copy";
import { ContinueLearning } from "@/modules/student/components/continue-learning";
import { mapStudentAttemptsToDashboardStats } from "@/lib/dashboard-adapters";
import { formatAcademicGrade } from "@/lib/evaluation-adapters";

const metricIcons = {
  "Casos completados": Brain,
  "Promedio de calificación": Target,
  "Tiempo de práctica": Clock,
  "Casos en progreso": Brain,
};

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const { data: attemptsPage } = useAttempts();
  const { data: evaluations } = useEvaluations();
  const firstName = user?.name?.split(" ")[0] ?? "Participante";
  const attempts = attemptsPage?.content ?? [];
  const latest = evaluations?.[0];
  const dashboardStats = mapStudentAttemptsToDashboardStats(attempts);
  const inProgress = attempts.find((attempt) => attempt.estado === "EN_PROCESO");
  const meta = getPageHeroMeta("/dashboard");

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={getPersonalizedHeroTitle("student", firstName)}
        description={getMotivationalMessage()}
        tags={["Simulación inmersiva", "Análisis clínico"]}
        stats={[
          {
            label: "Completados",
            value: dashboardStats[0]?.value ?? 0,
          },
          {
            label: "Calificación",
            value: dashboardStats[1]?.value ?? "Sin calificación",
          },
          {
            label: "En curso",
            value: dashboardStats[3]?.value ?? 0,
            hint: inProgress ? `Intento #${inProgress.id}` : "Sin sesiones activas",
          },
        ]}
        action={
          <>
            <Button asChild size="lg">
              <Link href="/courses">
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
            <p className="text-xs font-medium text-muted-foreground">Resumen académico</p>
            <p className="font-display text-3xl font-semibold tabular-nums">
              {attempts.length}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {attempts.length === 0
                ? "Aún no has registrado simulaciones."
                : `${attempts.filter((attempt) => attempt.estado === "FINALIZADO").length} finalizadas · ${attempts.filter((attempt) => attempt.programacionId != null).length} académicas`}
            </p>
          </div>
        }
      />

      <MetricGrid stats={dashboardStats} icons={metricIcons} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContinueLearning />
        </div>
        {latest ? (
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
              <InsightHighlight
                label="Calificación académica"
                value={
                  latest.attempt
                    ? formatAcademicGrade(latest.attempt)
                    : latest.score === null
                      ? "Sin calificación configurada"
                      : `${latest.score.toFixed(1)} / 5`
                }
                className="mt-3"
              />
              <p className="mt-3 text-sm">{latest.feedback[0]}</p>
            </InsightCard>
          </div>
        ) : (
          <div className="lg:col-span-2">
            <Surface variant="muted" className="h-full py-10 text-center text-sm text-muted-foreground">
              No hay evaluaciones finalizadas todavía.
            </Surface>
          </div>
        )}
      </div>
    </div>
  );
}
