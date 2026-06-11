import { apiConfig, apiEndpoints } from "@/config/api";
import { httpClient } from "@/services/http-client";
import { withQuery } from "@/services/query-params";
import type {
  CaseBuilderResponse,
  CaseFilters,
  CaseRequest,
  CaseResponse,
  OptionRequest,
  OptionResponse,
  QuestionRequest,
  QuestionResponse,
  SceneRequest,
  SceneResponse,
} from "@/types/clinical-case";
import type { PageResponse } from "@/types/page";

export interface CreateCaseBundleRequest {
  case: CaseRequest;
  scene: SceneRequest;
  question: QuestionRequest;
  options: [OptionRequest, OptionRequest];
}

export const clinicalCaseService = {
  list: (filters?: CaseFilters) =>
    httpClient.get<PageResponse<CaseResponse>>(
      withQuery(apiEndpoints.cases, filters)
    ),
  detail: (id: number) =>
    httpClient.get<CaseResponse>(`${apiEndpoints.cases}/${id}`),
  builder: (id: number) =>
    httpClient.get<CaseBuilderResponse>(`${apiEndpoints.cases}/${id}/builder`),
  create: (request: CaseRequest) =>
    httpClient.post<CaseResponse, CaseRequest>(apiEndpoints.cases, request),
  update: (id: number, request: CaseRequest) =>
    httpClient.put<CaseResponse, CaseRequest>(
      `${apiEndpoints.cases}/${id}`,
      request
    ),
  activate: (id: number) =>
    httpClient.patch<CaseResponse>(`${apiEndpoints.cases}/${id}/activate`),
  deactivate: (id: number) =>
    httpClient.patch<CaseResponse>(`${apiEndpoints.cases}/${id}/deactivate`),
  listScenes: (caseId: number) =>
    httpClient.get<SceneResponse[]>(`${apiEndpoints.cases}/${caseId}/scenes`),
  createScene: (caseId: number, request: SceneRequest) =>
    httpClient.post<SceneResponse, SceneRequest>(
      `${apiEndpoints.cases}/${caseId}/scenes`,
      request
    ),
  createQuestion: (sceneId: number, request: QuestionRequest) =>
    httpClient.post<QuestionResponse, QuestionRequest>(
      `${apiConfig.apiPrefix}/scenes/${sceneId}/questions`,
      request
    ),
  createOption: (questionId: number, request: OptionRequest) =>
    httpClient.post<OptionResponse, OptionRequest>(
      `${apiConfig.apiPrefix}/questions/${questionId}/options`,
      request
    ),
  createBundle: async (request: CreateCaseBundleRequest) => {
    const createdCase = await clinicalCaseService.create(request.case);
    const createdScene = await clinicalCaseService.createScene(
      createdCase.id,
      request.scene
    );
    const createdQuestion = await clinicalCaseService.createQuestion(
      createdScene.id,
      request.question
    );
    await Promise.all(
      request.options.map((option) =>
        clinicalCaseService.createOption(createdQuestion.id, option)
      )
    );
    return clinicalCaseService.builder(createdCase.id);
  },
} as const;
