import { apiConfig } from "@/config/api";
import { httpClient } from "@/services/http-client";
import { withQuery } from "@/services/query-params";
import type { TeacherMetricsFilters, TeacherMetricsResponse } from "@/types/teacher-metrics";

const teacherMetricsEndpoint = `${apiConfig.apiPrefix}/teacher/metrics`;

export const teacherMetricsService = {
  get: (filters?: TeacherMetricsFilters) =>
    httpClient.get<TeacherMetricsResponse>(withQuery(teacherMetricsEndpoint, filters)),
} as const;
