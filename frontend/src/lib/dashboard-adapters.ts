import type { DashboardStat } from "@/types";
import type { AttemptResponse } from "@/types/simulation";
import type { TeacherMetricsResponse } from "@/types/teacher-metrics";

function formatGradeAverage(attempts: AttemptResponse[]): string {
  const graded = attempts.filter(
    (attempt) => attempt.estado === "FINALIZADO" && attempt.notaFinal != null
  );
  if (graded.length === 0) {
    return "Sin calificación";
  }
  const average =
    graded.reduce((sum, attempt) => sum + Number(attempt.notaFinal), 0) /
    graded.length;
  return average.toFixed(1);
}

function formatPracticeHours(attempts: AttemptResponse[]): string {
  const finalized = attempts.filter(
    (attempt) => attempt.estado === "FINALIZADO" && attempt.fechaFin
  );
  if (finalized.length === 0) {
    return "0 h";
  }
  const totalSeconds = finalized.reduce((sum, attempt) => {
    const start = new Date(attempt.fechaInicio).getTime();
    const end = new Date(attempt.fechaFin as string).getTime();
    return sum + Math.max(0, Math.round((end - start) / 1000));
  }, 0);
  const hours = Math.round(totalSeconds / 3600);
  return `${hours} h`;
}

export function mapStudentAttemptsToDashboardStats(
  attempts: AttemptResponse[]
): DashboardStat[] {
  const completed = attempts.filter((attempt) => attempt.estado === "FINALIZADO");
  const inProgress = attempts.filter((attempt) => attempt.estado === "EN_PROCESO");

  return [
    {
      label: "Casos completados",
      value: completed.length,
      change: completed.length === 0 ? "Sin simulaciones finalizadas" : undefined,
      trend: "neutral",
    },
    {
      label: "Promedio de calificación",
      value: formatGradeAverage(attempts),
      change:
        completed.some((attempt) => attempt.notaFinal != null)
          ? "Escala 0–5"
          : "Sin calificación configurada",
      trend: "neutral",
    },
    {
      label: "Tiempo de práctica",
      value: formatPracticeHours(attempts),
      change: completed.length === 0 ? "Sin sesiones finalizadas" : undefined,
      trend: "neutral",
    },
    {
      label: "Casos en progreso",
      value: inProgress.length,
      change: inProgress.length === 0 ? "Sin sesiones activas" : undefined,
      trend: "neutral",
    },
  ];
}

export function mapTeacherMetricsToDashboardHero(
  metrics: TeacherMetricsResponse | undefined
): Array<{ label: string; value: string | number; hint?: string }> {
  if (!metrics) {
    return [
      { label: "Activos", value: 0, hint: "Sin datos" },
      { label: "Promedio", value: "N/D", hint: "Sin métricas" },
      { label: "Programaciones", value: 0, hint: "Sin programaciones" },
    ];
  }

  return [
    {
      label: "Matriculados",
      value: metrics.overview.enrolledParticipants,
      hint:
        metrics.overview.enrolledParticipants === 0
          ? "Sin estudiantes en grupos"
          : undefined,
    },
    {
      label: "Finalización",
      value: `${metrics.overview.completionRate}%`,
      hint: `${metrics.overview.completedAttempts} finalizadas`,
    },
    {
      label: "Programaciones",
      value: metrics.overview.activeSchedules,
      hint:
        metrics.overview.activeSchedules === 0
          ? "Sin programaciones activas"
          : "Vigentes",
    },
  ];
}

export function mapAdminCountsToDashboardStats(input: {
  users: number;
  cases: number;
  attempts: number;
  groups: number;
}): DashboardStat[] {
  return [
    {
      label: "Usuarios registrados",
      value: input.users,
      change: input.users === 0 ? "Sin usuarios" : undefined,
      trend: "neutral",
    },
    {
      label: "Grupos académicos",
      value: input.groups,
      change: input.groups === 0 ? "Sin grupos creados" : undefined,
      trend: "neutral",
    },
    {
      label: "Casos publicados",
      value: input.cases,
      change: input.cases === 0 ? "Sin casos activos" : undefined,
      trend: "neutral",
    },
    {
      label: "Intentos registrados",
      value: input.attempts,
      change: input.attempts === 0 ? "Sin simulaciones" : undefined,
      trend: "neutral",
    },
  ];
}
