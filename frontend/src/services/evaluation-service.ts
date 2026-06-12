import {
  isCompletedAttempt,
  mapAttemptSummaryToEvaluation,
} from "@/lib/evaluation-adapters";
import { attemptService } from "@/services/attempt-service";
import { pedagogicalService } from "@/services/pedagogical-service";
import type { EvaluationResult } from "@/types";
import type { AttemptResponse } from "@/types/simulation";

const DEFAULT_PAGE_SIZE = 100;

async function loadAiHistory(attemptId: number) {
  try {
    return await attemptService.aiSummaries(attemptId);
  } catch {
    return undefined;
  }
}

async function hydrateEvaluation(attempt: AttemptResponse): Promise<EvaluationResult> {
  const [summary, aiHistory, rdaEvaluation] = await Promise.all([
    attemptService.summary(attempt.id),
    loadAiHistory(attempt.id),
    pedagogicalService.rdaEvaluation(attempt.id).catch(() => null),
  ]);

  return mapAttemptSummaryToEvaluation(
    attempt,
    summary,
    aiHistory,
    rdaEvaluation?.resultados
  );
}

export const evaluationService = {
  getAll: async (): Promise<EvaluationResult[]> => {
    const page = await attemptService.list({
      size: DEFAULT_PAGE_SIZE,
      sort: "fechaInicio,desc",
    });

    const completedAttempts = page.content.filter(isCompletedAttempt);
    return Promise.all(completedAttempts.map(hydrateEvaluation));
  },
  getById: async (id: string): Promise<EvaluationResult | undefined> => {
    const attemptId = Number(id);
    if (!Number.isFinite(attemptId)) {
      return undefined;
    }

    const attempt = await attemptService.detail(attemptId);
    if (!isCompletedAttempt(attempt)) {
      return undefined;
    }

    return hydrateEvaluation(attempt);
  },
} as const;
