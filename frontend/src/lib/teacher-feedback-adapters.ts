import { isCompletedAttempt } from "@/lib/evaluation-adapters";
import type {
  AttemptResponse,
  AttemptSummaryResponse,
  FeedbackResponse,
} from "@/types/simulation";

export type TeacherFeedbackStatus = "pendiente" | "revisado";

export interface TeacherFeedbackItem {
  attemptId: number;
  studentName: string;
  caseTitle: string;
  comment: string;
  status: TeacherFeedbackStatus;
  teacherFeedback: FeedbackResponse | null;
  completedAt: string;
}

function findTeacherFeedback(
  retroalimentaciones: FeedbackResponse[]
): FeedbackResponse | null {
  return (
    retroalimentaciones.find((item) => item.autor === "DOCENTE") ?? null
  );
}

function buildComment(
  summary: AttemptSummaryResponse,
  teacherFeedback: FeedbackResponse | null
): string {
  if (teacherFeedback) {
    return teacherFeedback.contenido;
  }

  const systemFeedback = summary.retroalimentaciones.find(
    (item) => item.autor === "SISTEMA"
  );
  if (systemFeedback) {
    return systemFeedback.contenido;
  }

  if (summary.respuestas.length > 0) {
    return `Intento finalizado con ${summary.respuestas.length} respuesta(s) registrada(s). Pendiente de retroalimentación docente.`;
  }

  return "Intento finalizado. Pendiente de retroalimentación docente.";
}

export function mapAttemptToTeacherFeedbackItem(
  attempt: AttemptResponse,
  summary: AttemptSummaryResponse
): TeacherFeedbackItem {
  const teacherFeedback = findTeacherFeedback(summary.retroalimentaciones);

  return {
    attemptId: attempt.id,
    studentName: `Estudiante #${attempt.estudianteId}`,
    caseTitle: summary.caso.titulo,
    comment: buildComment(summary, teacherFeedback),
    status: teacherFeedback ? "revisado" : "pendiente",
    teacherFeedback,
    completedAt: attempt.fechaFin ?? attempt.fechaInicio,
  };
}

export function filterCompletedAttempts(
  attempts: AttemptResponse[]
): AttemptResponse[] {
  return attempts.filter(isCompletedAttempt);
}
