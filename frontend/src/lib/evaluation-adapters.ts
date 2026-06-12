import type { EvaluationMetric, EvaluationResult } from "@/types";
import type {
  AISummaryHistoryResponse,
  AttemptAnswerResponse,
  AttemptResponse,
  AttemptSummaryResponse,
  FeedbackResponse,
  SimulationStateResponse,
} from "@/types/simulation";

const POSITIVE_STATES = new Set(["CONFIANZA", "COOPERACION"]);
const CHALLENGE_STATES = new Set(["ANSIEDAD", "ESTRES", "RESISTENCIA"]);
const STATE_THRESHOLD = 60;

export function mapStatesToMetrics(
  estados: SimulationStateResponse[]
): EvaluationMetric[] {
  return estados.map((estado) => ({
    id: String(estado.estadoEmocionalId),
    label: estado.nombre,
    value: estado.valorActual,
    maxValue: estado.valorMaximo,
    description:
      estado.descripcion ?? `Estado emocional ${estado.nombre.toLowerCase()}`,
  }));
}

function mapActionHistoryLines(respuestas: AttemptAnswerResponse[]): string[] {
  if (respuestas.length === 0) {
    return [];
  }

  return [
    "Historial de decisiones registradas:",
    ...respuestas.map(
      (respuesta, index) =>
        `${index + 1}. ${respuesta.pregunta} → ${respuesta.opcion}`
    ),
  ];
}

function mapFeedbackLines(
  retroalimentaciones: FeedbackResponse[]
): string[] {
  return retroalimentaciones.flatMap((item) => {
    const lines = [`[${item.autor}] ${item.contenido}`];
    if (item.observaciones) {
      lines.push(item.observaciones);
    }
    return lines;
  });
}

function mapAiSummaryLines(
  aiHistory?: AISummaryHistoryResponse
): string[] {
  if (!aiHistory?.sintesis.length) {
    return [];
  }

  return aiHistory.sintesis.flatMap((item) => {
    const prefix = item.fueExitosa
      ? `[IA · ${item.modeloUtilizado}]`
      : "[IA · respuesta alternativa]";
    const lines = [`${prefix} ${item.respuestaGenerada}`];
    if (!item.fueExitosa && item.mensajeError) {
      lines.push(`Detalle técnico: ${item.mensajeError}`);
    }
    return lines;
  });
}

export function buildEvaluationFeedback(
  summary: AttemptSummaryResponse,
  aiHistory?: AISummaryHistoryResponse
): string[] {
  const lines = [
    ...mapActionHistoryLines(summary.respuestas),
    ...mapFeedbackLines(summary.retroalimentaciones),
    ...mapAiSummaryLines(aiHistory),
  ];

  return lines.length > 0
    ? lines
    : ["Aun no hay retroalimentacion registrada para este intento."];
}

export function deriveStrengthsFromStates(
  estados: SimulationStateResponse[]
): string[] {
  return estados
    .filter(
      (estado) =>
        POSITIVE_STATES.has(estado.nombre) &&
        estado.valorActual >= STATE_THRESHOLD
    )
    .map((estado) => `${estado.nombre}: ${estado.valorActual}%`);
}

export function deriveImprovementsFromStates(
  estados: SimulationStateResponse[]
): string[] {
  return estados
    .filter(
      (estado) =>
        CHALLENGE_STATES.has(estado.nombre) &&
        estado.valorActual >= STATE_THRESHOLD
    )
    .map((estado) => `${estado.nombre} elevado: ${estado.valorActual}%`);
}

function resolveAcademicScore(attempt: AttemptResponse): number | null {
  if (attempt.notaFinal == null) {
    return null;
  }
  return Number(attempt.notaFinal);
}

export function formatAcademicGrade(attempt: AttemptResponse): string {
  if (attempt.notaFinal == null) {
    return "Sin calificación configurada";
  }
  const points =
    attempt.puntosObtenidos != null && attempt.puntosMaximos != null
      ? ` (${attempt.puntosObtenidos}/${attempt.puntosMaximos} pts)`
      : "";
  return `${Number(attempt.notaFinal).toFixed(1)} / 5${points}`;
}

export function mapAttemptSummaryToEvaluation(
  attempt: AttemptResponse,
  summary: AttemptSummaryResponse,
  aiHistory?: AISummaryHistoryResponse
): EvaluationResult {
  return {
    id: String(attempt.id),
    caseId: String(summary.caso.id),
    caseTitle: summary.caso.titulo,
    studentName: `Estudiante #${attempt.estudianteId}`,
    completedAt: attempt.fechaFin ?? attempt.fechaInicio,
    score: resolveAcademicScore(attempt),
    metrics: mapStatesToMetrics(summary.estados),
    feedback: buildEvaluationFeedback(summary, aiHistory),
    strengths: deriveStrengthsFromStates(summary.estados),
    improvements: deriveImprovementsFromStates(summary.estados),
    attempt,
    summary,
    aiSummaries: aiHistory?.sintesis ?? [],
  };
}

export function isCompletedAttempt(attempt: AttemptResponse): boolean {
  return attempt.estado === "FINALIZADO";
}
