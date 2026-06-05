import { apiEndpoints } from "@/config/api";
import { httpClient } from "@/services/http-client";

export type HealthStatus = "UP" | "DOWN" | "OUT_OF_SERVICE" | "UNKNOWN";

export interface HealthResponse {
  status: HealthStatus;
}

export const healthService = {
  check: () =>
    httpClient.get<HealthResponse>(apiEndpoints.health, {
      auth: false,
      retryOnUnauthorized: false,
    }),
} as const;
