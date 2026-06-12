"use client";

import { BarChart3, Users, ClipboardList, MessageSquareText } from "lucide-react";
import {
  HeroSection,
  MetricGrid,
  Surface,
  SectionHeader,
  CompetencyRadar,
  PageLoading,
} from "@/components/design-system";
import { Progress } from "@/components/ui/progress";
import { getPageHeroMeta } from "@/lib/page-meta";
import {
  formatDuration,
  formatEmotionalStateName,
  hasInsufficientEmotionalSample,
  mapEmotionalProfileToRadarMetrics,
  mapTeacherMetricsToOverviewStats,
} from "@/lib/teacher-metrics-adapters";
import { useTeacherMetrics } from "@/hooks/use-data";
import { ApiError } from "@/services/api-error";

const teacherMetricIcons = {
  "Participantes matriculados": Users,
  "Tasa de finalización": BarChart3,
  "Programaciones activas": ClipboardList,
  "Pendientes de retroalimentación": MessageSquareText,
};

export default function TeacherMetricsPage() {
  const meta = getPageHeroMeta("/teacher/metrics");
  const { data: metrics, isLoading, isError, error } = useTeacherMetrics();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !metrics) {
    return (
      <div className="space-y-8">
        <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          {error instanceof ApiError
            ? error.message
            : "No se pudieron cargar las métricas terapéuticas."}
        </Surface>
      </div>
    );
  }

  const overviewStats = mapTeacherMetricsToOverviewStats(metrics);
  const radarMetrics = mapEmotionalProfileToRadarMetrics(metrics);
  const insufficientSample = hasInsufficientEmotionalSample(metrics);
  const hasGroups = metrics.byGroup.length > 0;
  const hasCompletedSimulations = metrics.overview.completedAttempts > 0;

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      <p className="text-sm text-muted-foreground">{metrics.metadata.academicNotice}</p>

      {!hasGroups && (
        <Surface variant="muted" className="py-8 text-center text-sm text-muted-foreground">
          Aún no tienes grupos asignados.
        </Surface>
      )}

      {hasGroups && metrics.overview.activeSchedules === 0 && (
        <Surface variant="muted" className="py-4 text-center text-sm text-muted-foreground">
          Crea una programación para vincular simulaciones a tus grupos.
        </Surface>
      )}

      <MetricGrid stats={overviewStats} icons={teacherMetricIcons} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHeader title="Participación por grupo" />
          {!hasGroups ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Aún no tienes grupos asignados.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {metrics.byGroup.map((group) => (
                <div key={group.groupId}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{group.groupName}</span>
                    <span className="text-muted-foreground">
                      {group.studentsCount} matriculados
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Participación</span>
                        <span>{group.participationRate}%</span>
                      </div>
                      <Progress value={group.participationRate} className="h-1.5" />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Finalización</span>
                        <span>{group.completionRate}%</span>
                      </div>
                      <Progress value={group.completionRate} className="h-1.5" />
                    </div>
                    {group.strength && (
                      <p className="text-xs text-muted-foreground">
                        Fortaleza: {formatEmotionalStateName(group.strength.replace(" simulada", ""))}
                      </p>
                    )}
                    {group.attentionArea && (
                      <p className="text-xs text-muted-foreground">
                        Reforzar: {formatEmotionalStateName(group.attentionArea.replace(" simulada", ""))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>

        {insufficientSample ? (
          <Surface className="flex min-h-[320px] items-center justify-center p-6 text-center">
            <div>
              <SectionHeader title="Perfil emocional agregado" />
              <p className="mt-4 text-sm text-muted-foreground">
                Datos insuficientes para perfil agregado
              </p>
            </div>
          </Surface>
        ) : (
          <CompetencyRadar metrics={radarMetrics} />
        )}
      </div>

      <Surface variant="muted">
        <SectionHeader title="Resumen del periodo" />
        {!hasCompletedSimulations ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No hay simulaciones finalizadas en este periodo.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Sesiones completadas",
                value: String(metrics.semesterSummary.completedSessions),
              },
              {
                label: "Duración promedio",
                value: formatDuration(metrics.semesterSummary.averageSessionDurationSeconds),
              },
              {
                label: "Participantes con indicadores elevados",
                value: String(metrics.overview.elevatedIndicators),
                accent: "text-brand",
              },
              {
                label: "Caso más practicado",
                value:
                  metrics.semesterSummary.mostPracticedCase?.titulo ?? "N/D",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between rounded-lg border border-border/40 bg-background/50 p-3 text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold ${row.accent ?? ""}`}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}
