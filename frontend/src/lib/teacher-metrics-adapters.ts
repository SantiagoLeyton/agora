import type { DashboardStat, EvaluationMetric } from "@/types";
import type { TeacherMetricsResponse } from "@/types/teacher-metrics";

const emotionalLabels: Record<string, string> = {
  ANSIEDAD: "Ansiedad",
  ESTRES: "Estrés",
  CONFIANZA: "Confianza",
  COOPERACION: "Cooperación",
  RESISTENCIA: "Resistencia",
};

export function formatEmotionalStateName(name: string): string {
  return emotionalLabels[name] ?? name;
}

export function mapTeacherMetricsToOverviewStats(
  metrics: TeacherMetricsResponse
): DashboardStat[] {
  const { overview } = metrics;
  return [
    {
      label: "Participantes matriculados",
      value: overview.enrolledParticipants,
      change:
        overview.enrolledParticipants > 0
          ? `${metrics.byGroup.length} grupo(s)`
          : undefined,
      trend: "neutral",
    },
    {
      label: "Tasa de finalización",
      value: `${overview.completionRate}%`,
      change: `${overview.completedAttempts} de ${overview.completedAttempts + overview.inProgressAttempts + overview.abandonedAttempts} simulaciones`,
      trend: overview.completionRate >= 60 ? "up" : "neutral",
    },
    {
      label: "Programaciones activas",
      value: overview.activeSchedules,
      change: overview.activeSchedules === 0 ? "Sin programaciones vigentes" : "Vigentes",
      trend: "neutral",
    },
    {
      label: "Pendientes de retroalimentación",
      value: overview.pendingFeedback,
      change:
        overview.pendingFeedback > 0 ? "Requieren respuesta docente" : "Al día",
      trend: overview.pendingFeedback > 0 ? "down" : "up",
    },
  ];
}

export function mapEmotionalProfileToRadarMetrics(
  metrics: TeacherMetricsResponse
): EvaluationMetric[] {
  return metrics.emotionalProfile.map((item, index) => ({
    id: String(index + 1),
    label: formatEmotionalStateName(item.name),
    value: Math.round(item.average),
    maxValue: 100,
    description: `n = ${item.sampleSize}`,
  }));
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "N/D";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
}

export function hasInsufficientEmotionalSample(metrics: TeacherMetricsResponse): boolean {
  return metrics.metadata.sampleSize < 3;
}
