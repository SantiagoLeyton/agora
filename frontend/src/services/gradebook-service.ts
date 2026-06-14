import { apiConfig, buildApiUrl } from "@/config/api";
import { ApiError, parseApiErrorPayload } from "@/services/api-error";
import { getAccessToken, refreshAccessToken } from "@/services/auth-token-provider";
import { httpClient } from "@/services/http-client";
import { withQuery, type QueryParams } from "@/services/query-params";
import type { PageResponse } from "@/types/page";
import type {
  GradebookAnalytics,
  GradebookDetail,
  GradebookEntry,
  GradebookExportFormat,
  GradebookFilters,
} from "@/types/gradebook";

const gradebookEndpoint = `${apiConfig.apiPrefix}/gradebook`;

export const gradebookService = {
  list: (filters: GradebookFilters = {}) =>
    httpClient.get<PageResponse<GradebookEntry>>(
      withQuery(`${gradebookEndpoint}/entries`, filters as QueryParams)
    ),

  analytics: (filters: Omit<GradebookFilters, "page" | "size" | "sort"> = {}) =>
    httpClient.get<GradebookAnalytics>(
      withQuery(`${gradebookEndpoint}/analytics`, filters as QueryParams)
    ),

  detail: (attemptId: number) =>
    httpClient.get<GradebookDetail>(`${gradebookEndpoint}/entries/${attemptId}/detail`),

  downloadExport: async (
    format: GradebookExportFormat,
    filters: Omit<GradebookFilters, "page" | "size" | "sort"> = {}
  ): Promise<Blob> => {
    const queryFormat = format === "excel" ? "excel" : "csv";
    const path = withQuery(`${gradebookEndpoint}/export`, { ...filters, format: queryFormat } as QueryParams);
    return fetchBlob(path);
  },
} as const;

async function fetchBlob(path: string, retry = true): Promise<Blob> {
  const token = await getAccessToken();
  const response = await fetch(buildApiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return fetchBlob(path, false);
    }
  }

  if (!response.ok) {
    let payload: unknown = undefined;
    try {
      payload = await response.json();
    } catch {
      payload = await response.text();
    }
    throw new ApiError(parseApiErrorPayload(payload, response.status, response.statusText));
  }

  return response.blob();
}

export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
