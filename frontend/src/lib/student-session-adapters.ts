import type { ScheduleResponse } from "@/types/academic-admin";
import type { AttemptResponse } from "@/types/simulation";

export type AssignedSessionStatus =
  | "pendiente"
  | "disponible"
  | "en_proceso"
  | "finalizada"
  | "cerrada";

export interface AssignedSession {
  scheduleId: number;
  caseId: number;
  caseTitle: string;
  groupName: string;
  teacherEmail: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  status: AssignedSessionStatus;
  attemptId?: number;
}

function resolveSessionStatus(
  schedule: ScheduleResponse,
  attempt: AttemptResponse | undefined,
  now: Date
): AssignedSessionStatus {
  const start = new Date(schedule.fechaInicio);
  const end = new Date(schedule.fechaFin);

  if (attempt?.estado === "FINALIZADO") return "finalizada";
  if (attempt?.estado === "EN_PROCESO") return "en_proceso";
  if (now > end) return "cerrada";
  if (now < start) return "pendiente";
  return "disponible";
}

export function mapSchedulesToAssignedSessions(
  schedules: ScheduleResponse[],
  attempts: AttemptResponse[],
  caseTitlesById: Map<number, string>
): AssignedSession[] {
  const now = new Date();

  return schedules
    .filter((schedule) => schedule.casoId !== null)
    .map((schedule) => {
      const caseId = schedule.casoId as number;
      const linkedAttempt = attempts.find(
        (attempt) => attempt.programacionId === schedule.id
      );

      return {
        scheduleId: schedule.id,
        caseId,
        caseTitle: caseTitlesById.get(caseId) ?? `Caso ${caseId}`,
        groupName: schedule.grupoNombre,
        teacherEmail: schedule.docenteCorreo,
        fechaInicio: schedule.fechaInicio,
        fechaFin: schedule.fechaFin,
        activo: schedule.activo,
        status: resolveSessionStatus(schedule, linkedAttempt, now),
        attemptId: linkedAttempt?.id,
      };
    })
    .sort(
      (left, right) =>
        new Date(right.fechaInicio).getTime() - new Date(left.fechaInicio).getTime()
    );
}

export function assignedSessionStatusLabel(status: AssignedSessionStatus): string {
  switch (status) {
    case "pendiente":
      return "Pendiente";
    case "disponible":
      return "Disponible";
    case "en_proceso":
      return "En proceso";
    case "finalizada":
      return "Finalizada";
    case "cerrada":
      return "Cerrada";
    default:
      return status;
  }
}

export function canStartAssignedSession(session: AssignedSession): boolean {
  return (
    session.activo &&
    (session.status === "disponible" || session.status === "en_proceso")
  );
}
