import { apiConfig } from "@/config/api";
import { httpClient } from "@/services/http-client";
import { withQuery } from "@/services/query-params";
import type {
  InstitutionalEntityResponse,
  ToolResponse,
} from "@/types/clinical-case";
import type { PageResponse } from "@/types/page";

export const caseResourceService = {
  listTools: (filters?: { activo?: boolean; size?: number }) =>
    httpClient.get<PageResponse<ToolResponse>>(
      withQuery(`${apiConfig.apiPrefix}/tools`, { activo: true, size: 100, ...filters })
    ),
  listEntities: (filters?: { activo?: boolean; size?: number }) =>
    httpClient.get<PageResponse<InstitutionalEntityResponse>>(
      withQuery(`${apiConfig.apiPrefix}/institutional-entities`, {
        activo: true,
        size: 100,
        ...filters,
      })
    ),
} as const;
