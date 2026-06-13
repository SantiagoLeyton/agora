import { apiEndpoints } from "@/config/api";
import { httpClient } from "@/services/http-client";
import { withQuery } from "@/services/query-params";
import type { PageRequest, PageResponse } from "@/types/page";
import type {
  AISummaryHistoryResponse,
  AISummaryRequest,
  AISummaryResponse,
  AttemptConsequenceListResponse,
  AttemptResponse,
  AttemptSummaryResponse,
  CreateFeedbackRequest,
  FeedbackResponse,
  JournalResponse,
  PedagogicalAnalysisResponse,
  SimulationResponse,
} from "@/types/simulation";

export interface AttemptFilters extends PageRequest {
  [key: string]: string | number | boolean | undefined | null;
  estado?: string;
}

function attemptPath(attemptId: number): string {
  return `${apiEndpoints.attempts}/${attemptId}`;
}

export const attemptService = {
  list: (filters?: AttemptFilters) =>
    httpClient.get<PageResponse<AttemptResponse>>(
      withQuery(apiEndpoints.attempts, filters)
    ),
  detail: (attemptId: number) =>
    httpClient.get<AttemptResponse>(attemptPath(attemptId)),
  simulationDetail: (attemptId: number) =>
    httpClient.get<SimulationResponse>(
      `${apiEndpoints.simulations}/${attemptId}`
    ),
  feedback: (attemptId: number) =>
    httpClient.get<FeedbackResponse[]>(`${attemptPath(attemptId)}/feedback`),
  createFeedback: (attemptId: number, request: CreateFeedbackRequest) =>
    httpClient.post<FeedbackResponse, CreateFeedbackRequest>(
      `${attemptPath(attemptId)}/feedback`,
      request
    ),
  updateFeedback: (attemptId: number, feedbackId: number, request: CreateFeedbackRequest) =>
    httpClient.put<FeedbackResponse, CreateFeedbackRequest>(
      `${attemptPath(attemptId)}/feedback/${feedbackId}`,
      request
    ),
  journal: (attemptId: number) =>
    httpClient.get<JournalResponse[]>(`${attemptPath(attemptId)}/journal`),
  summary: (attemptId: number) =>
    httpClient.get<AttemptSummaryResponse>(`${attemptPath(attemptId)}/summary`),
  aiSummaries: (attemptId: number) =>
    httpClient.get<AISummaryHistoryResponse>(
      `${attemptPath(attemptId)}/ai/summary`
    ),
  generateAISummary: (attemptId: number, request: AISummaryRequest = {}) =>
    httpClient.post<AISummaryResponse, AISummaryRequest>(
      `${attemptPath(attemptId)}/ai/summary`,
      request
    ),
  consequences: (attemptId: number) =>
    httpClient.get<AttemptConsequenceListResponse>(
      `${attemptPath(attemptId)}/consequences`
    ),
  pedagogicalAnalysis: (attemptId: number) =>
    httpClient.get<PedagogicalAnalysisResponse>(
      `${attemptPath(attemptId)}/pedagogical-analysis`
    ),
} as const;
