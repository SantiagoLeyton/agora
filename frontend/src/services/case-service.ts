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

export interface CreateCaseBundleQuestion {
  question: QuestionRequest;
  options: OptionRequest[];
}

export interface CreateCaseBundleScene {
  scene: SceneRequest;
  questions: CreateCaseBundleQuestion[];
}

export interface CreateCaseBundleRequest {
  case: CaseRequest;
  scenes: CreateCaseBundleScene[];
}

export function validateCaseBundleRequest(
  request: CreateCaseBundleRequest
): string | null {
  if (!request.scenes.length) {
    return "El caso debe tener al menos una escena.";
  }

  for (let sceneIndex = 0; sceneIndex < request.scenes.length; sceneIndex += 1) {
    const sceneBundle = request.scenes[sceneIndex];
    if (!sceneBundle.questions.length) {
      return `La escena ${sceneIndex + 1} debe tener al menos una pregunta.`;
    }

    for (
      let questionIndex = 0;
      questionIndex < sceneBundle.questions.length;
      questionIndex += 1
    ) {
      const questionBundle = sceneBundle.questions[questionIndex];
      if (questionBundle.options.length < 2) {
        return `La pregunta ${questionIndex + 1} de la escena ${sceneIndex + 1} debe tener al menos 2 opciones.`;
      }
    }
  }

  return null;
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
    const validationError = validateCaseBundleRequest(request);
    if (validationError) {
      throw new Error(validationError);
    }

    const createdCase = await clinicalCaseService.create(request.case);

    for (const sceneBundle of request.scenes) {
      const createdScene = await clinicalCaseService.createScene(
        createdCase.id,
        sceneBundle.scene
      );

      for (const questionBundle of sceneBundle.questions) {
        const createdQuestion = await clinicalCaseService.createQuestion(
          createdScene.id,
          questionBundle.question
        );

        for (const option of questionBundle.options) {
          await clinicalCaseService.createOption(createdQuestion.id, option);
        }
      }
    }

    return clinicalCaseService.builder(createdCase.id);
  },
} as const;
