import { apiConfig } from "@/config/api";
import { httpClient } from "@/services/http-client";
import type {
  AcademicProgressResponse,
  RdaAttemptEvaluation,
} from "@/types/pedagogical";

export const pedagogicalService = {
  rdaEvaluation: (attemptId: number) =>
    httpClient.get<RdaAttemptEvaluation>(
      `${apiConfig.apiPrefix}/attempts/${attemptId}/rda-evaluation`
    ),
  myProgress: () =>
    httpClient.get<AcademicProgressResponse>(
      `${apiConfig.apiPrefix}/academic-progress/me`
    ),
  studentProgress: (studentId: number) =>
    httpClient.get<AcademicProgressResponse>(
      `${apiConfig.apiPrefix}/academic-progress/students/${studentId}`
    ),
} as const;
