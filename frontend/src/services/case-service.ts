import { apiConfig, apiEndpoints } from "@/config/api";
import { httpClient } from "@/services/http-client";
import { withQuery } from "@/services/query-params";
import type {
  CaseBuilderResponse,
  CaseFilters,
  CaseRequest,
  CaseResponse,
  LearningOutcomeRequest,
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
  learningOutcomes: LearningOutcomeRequest[];
  toolIds?: number[];
  entityIds?: number[];
}

export interface UpdateCaseBundleScene {
  sceneId?: number;
  scene: SceneRequest;
  questions: Array<{
    questionId?: number;
    question: QuestionRequest;
    options: Array<{
      optionId?: number;
      option: OptionRequest;
    }>;
  }>;
}

export interface UpdateCaseBundleRequest {
  case: CaseRequest;
  scenes: UpdateCaseBundleScene[];
  learningOutcomes: LearningOutcomeRequest[];
  toolIds: number[];
  entityIds: number[];
}

export function validateCaseBundleRequest(request: {
  scenes: Array<{ questions: Array<{ options: unknown[] }> }>;
  learningOutcomes: LearningOutcomeRequest[];
}): string | null {
  if (!request.learningOutcomes.length) {
    return "El caso debe tener al menos un resultado de aprendizaje.";
  }
  const normalized = request.learningOutcomes.map((item) => item.descripcion.trim().toLowerCase());
  if (normalized.some((item) => !item)) {
    return "Los resultados de aprendizaje no pueden estar vacíos.";
  }
  if (new Set(normalized).size !== normalized.length) {
    return "Los resultados de aprendizaje no pueden duplicarse.";
  }
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

async function linkResources(
  caseId: number,
  toolIds: number[] = [],
  entityIds: number[] = []
) {
  for (const toolId of toolIds) {
    await clinicalCaseService.linkTool(caseId, toolId);
  }
  for (const entityId of entityIds) {
    await clinicalCaseService.linkEntity(caseId, entityId);
  }
}

async function syncAssociations(
  caseId: number,
  toolIds: number[],
  entityIds: number[],
  existing: CaseBuilderResponse
) {
  const existingToolIds = new Set(existing.herramientas.map((tool) => tool.id));
  const existingEntityIds = new Set(existing.entidades.map((entity) => entity.id));
  const desiredToolIds = new Set(toolIds);
  const desiredEntityIds = new Set(entityIds);

  for (const toolId of existingToolIds) {
    if (!desiredToolIds.has(toolId)) {
      await clinicalCaseService.unlinkTool(caseId, toolId);
    }
  }
  for (const entityId of existingEntityIds) {
    if (!desiredEntityIds.has(entityId)) {
      await clinicalCaseService.unlinkEntity(caseId, entityId);
    }
  }
  for (const toolId of desiredToolIds) {
    if (!existingToolIds.has(toolId)) {
      await clinicalCaseService.linkTool(caseId, toolId);
    }
  }
  for (const entityId of desiredEntityIds) {
    if (!existingEntityIds.has(entityId)) {
      await clinicalCaseService.linkEntity(caseId, entityId);
    }
  }
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
  delete: (id: number) =>
    httpClient.delete<void>(`${apiEndpoints.cases}/${id}`),
  syncLearningOutcomes: (caseId: number, outcomes: LearningOutcomeRequest[]) =>
    httpClient.put<import("@/types/clinical-case").LearningOutcomeResponse[], LearningOutcomeRequest[]>(
      `${apiEndpoints.cases}/${caseId}/learning-outcomes/sync`,
      outcomes
    ),
  listScenes: (caseId: number) =>
    httpClient.get<SceneResponse[]>(`${apiEndpoints.cases}/${caseId}/scenes`),
  createScene: (caseId: number, request: SceneRequest) =>
    httpClient.post<SceneResponse, SceneRequest>(
      `${apiEndpoints.cases}/${caseId}/scenes`,
      request
    ),
  updateScene: (sceneId: number, request: SceneRequest) =>
    httpClient.put<SceneResponse, SceneRequest>(
      `${apiConfig.apiPrefix}/scenes/${sceneId}`,
      request
    ),
  deleteScene: (sceneId: number) =>
    httpClient.delete<void>(`${apiConfig.apiPrefix}/scenes/${sceneId}`),
  createQuestion: (sceneId: number, request: QuestionRequest) =>
    httpClient.post<QuestionResponse, QuestionRequest>(
      `${apiConfig.apiPrefix}/scenes/${sceneId}/questions`,
      request
    ),
  updateQuestion: (questionId: number, request: QuestionRequest) =>
    httpClient.put<QuestionResponse, QuestionRequest>(
      `${apiConfig.apiPrefix}/questions/${questionId}`,
      request
    ),
  deleteQuestion: (questionId: number) =>
    httpClient.delete<void>(`${apiConfig.apiPrefix}/questions/${questionId}`),
  createOption: (questionId: number, request: OptionRequest) =>
    httpClient.post<OptionResponse, OptionRequest>(
      `${apiConfig.apiPrefix}/questions/${questionId}/options`,
      request
    ),
  updateOption: (optionId: number, request: OptionRequest) =>
    httpClient.put<OptionResponse, OptionRequest>(
      `${apiConfig.apiPrefix}/options/${optionId}`,
      request
    ),
  deleteOption: (optionId: number) =>
    httpClient.delete<void>(`${apiConfig.apiPrefix}/options/${optionId}`),
  linkTool: (caseId: number, toolId: number) =>
    httpClient.post<CaseResponse>(
      `${apiEndpoints.cases}/${caseId}/tools/${toolId}`
    ),
  unlinkTool: (caseId: number, toolId: number) =>
    httpClient.delete<CaseResponse>(
      `${apiEndpoints.cases}/${caseId}/tools/${toolId}`
    ),
  linkEntity: (caseId: number, entityId: number) =>
    httpClient.post<CaseResponse>(
      `${apiEndpoints.cases}/${caseId}/entities/${entityId}`
    ),
  unlinkEntity: (caseId: number, entityId: number) =>
    httpClient.delete<CaseResponse>(
      `${apiEndpoints.cases}/${caseId}/entities/${entityId}`
    ),
  createBundle: async (request: CreateCaseBundleRequest) => {
    const validationError = validateCaseBundleRequest(request);
    if (validationError) {
      throw new Error(validationError);
    }

    const createdCase = await clinicalCaseService.create(request.case);
    await clinicalCaseService.syncLearningOutcomes(
      createdCase.id,
      request.learningOutcomes
    );

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

    await linkResources(
      createdCase.id,
      request.toolIds ?? [],
      request.entityIds ?? []
    );

    return clinicalCaseService.builder(createdCase.id);
  },
  updateBundle: async (caseId: number, request: UpdateCaseBundleRequest) => {
    const validationError = validateCaseBundleRequest(request);
    if (validationError) {
      throw new Error(validationError);
    }

    const existing = await clinicalCaseService.builder(caseId);
    await clinicalCaseService.update(caseId, request.case);
    await clinicalCaseService.syncLearningOutcomes(caseId, request.learningOutcomes);

    const retainedSceneIds = new Set(
      request.scenes
        .map((scene) => scene.sceneId)
        .filter((id): id is number => Number.isFinite(id))
    );

    for (const sceneBundle of existing.escenas) {
      if (!retainedSceneIds.has(sceneBundle.escena.id)) {
        await clinicalCaseService.deleteScene(sceneBundle.escena.id);
      }
    }

    for (const sceneBundle of request.scenes) {
      const scene =
        sceneBundle.sceneId != null
          ? await clinicalCaseService.updateScene(sceneBundle.sceneId, sceneBundle.scene)
          : await clinicalCaseService.createScene(caseId, sceneBundle.scene);

      const retainedQuestionIds = new Set(
        sceneBundle.questions
          .map((question) => question.questionId)
          .filter((id): id is number => Number.isFinite(id))
      );

      const existingScene = existing.escenas.find(
        (item) => item.escena.id === sceneBundle.sceneId
      );
      for (const questionBundle of existingScene?.preguntas ?? []) {
        if (!retainedQuestionIds.has(questionBundle.pregunta.id)) {
          await clinicalCaseService.deleteQuestion(questionBundle.pregunta.id);
        }
      }

      for (const questionBundle of sceneBundle.questions) {
        const question =
          questionBundle.questionId != null
            ? await clinicalCaseService.updateQuestion(
                questionBundle.questionId,
                questionBundle.question
              )
            : await clinicalCaseService.createQuestion(scene.id, questionBundle.question);

        const retainedOptionIds = new Set(
          questionBundle.options
            .map((option) => option.optionId)
            .filter((id): id is number => Number.isFinite(id))
        );

        const existingQuestion = existingScene?.preguntas.find(
          (item) => item.pregunta.id === questionBundle.questionId
        );
        for (const optionBundle of existingQuestion?.opciones ?? []) {
          if (!retainedOptionIds.has(optionBundle.id)) {
            await clinicalCaseService.deleteOption(optionBundle.id);
          }
        }

        for (const optionBundle of questionBundle.options) {
          if (optionBundle.optionId != null) {
            await clinicalCaseService.updateOption(
              optionBundle.optionId,
              optionBundle.option
            );
          } else {
            await clinicalCaseService.createOption(question.id, optionBundle.option);
          }
        }
      }
    }

    await syncAssociations(caseId, request.toolIds, request.entityIds, existing);
    return clinicalCaseService.builder(caseId);
  },
} as const;
