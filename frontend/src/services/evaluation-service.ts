import { attemptService } from "@/services/attempt-service";
import type { EvaluationResult } from "@/types";
import type {
  AISummaryHistoryResponse,
  AttemptResponse,
  AttemptSummaryResponse,
} from "@/types/simulation";

const DEFAULT_PAGE_SIZE = 100;

function newestFirst<T extends { fechaGeneracion?: string; fechaRespuesta?: string }>(
  items: T[],
  key: keyof T
): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(String(b[key] ?? 0)).getTime() -
      new Date(String(a[key] ?? 0)).getTime()
  );
}

function feedbackLines(
  summary: AttemptSummaryResponse,
  aiHistory?: AISummaryHistoryResponse
): string[] {
  const feedback = newestFirst(summary.retroalimentaciones, "fechaGeneracion")
    .map((item) => item.contenido)
    .filter(Boolean);
  const ai = aiHistory?.sintesis
    .filter((item) => item.respuestaGenerada)
    .map((item) => item.respuestaGenerada) ?? [];

  return [...ai, ...feedback];
}

function mapAttemptToEvaluation(
  attempt: AttemptResponse,
  summary: AttemptSummaryResponse,
  aiHistory?: AISummaryHistoryResponse
): EvaluationResult {
  const feedback = feedbackLines(summary, aiHistory);

  return {
    id: String(attempt.id),
    caseId: String(summary.caso.id),
    caseTitle: summary.caso.titulo,
    studentName: `Estudiante #${attempt.estudianteId}`,
    completedAt: attempt.fechaFin ?? attempt.fechaInicio,
    score: null,
    metrics: [],
    feedback:
      feedback.length > 0
        ? feedback
        : ["Aun no hay retroalimentacion registrada para este intento."],
    strengths: [],
    improvements: [],
    attempt,
    summary,
    aiSummaries: aiHistory?.sintesis ?? [],
  };
}

async function hydrateEvaluation(attempt: AttemptResponse) {
  const [summary, aiHistory] = await Promise.all([
    attemptService.summary(attempt.id),
    attemptService.aiSummaries(attempt.id).catch(() => undefined),
  ]);

  return mapAttemptToEvaluation(attempt, summary, aiHistory);
}

export const evaluationService = {
  getAll: async (): Promise<EvaluationResult[]> => {
    const page = await attemptService.list({
      size: DEFAULT_PAGE_SIZE,
      sort: "fechaInicio,desc",
    });

    return Promise.all(page.content.map(hydrateEvaluation));
  },
  getById: async (id: string): Promise<EvaluationResult | undefined> => {
    const attemptId = Number(id);
    if (!Number.isFinite(attemptId)) {
      return undefined;
    }

    const attempt = await attemptService.detail(attemptId);
    return hydrateEvaluation(attempt);
  },
} as const;
