import { apiEndpoints } from "@/config/api";
import { httpClient } from "@/services/http-client";
import type {
  AnswerResponse,
  AnswerSimulationRequest,
  AttemptSummaryResponse,
  SimulationResponse,
  SimulationStartedResponse,
  SimulationStateResponse,
  StartSimulationRequest,
} from "@/types/simulation";

function simulationPath(id: number): string {
  return `${apiEndpoints.simulations}/${id}`;
}

export const simulationService = {
  start: (request: StartSimulationRequest) =>
    httpClient.post<SimulationStartedResponse, StartSimulationRequest>(
      `${apiEndpoints.simulations}/start`,
      request
    ),
  detail: (id: number) => httpClient.get<SimulationResponse>(simulationPath(id)),
  answer: (id: number, request: AnswerSimulationRequest) =>
    httpClient.post<AnswerResponse, AnswerSimulationRequest>(
      `${simulationPath(id)}/answer`,
      request
    ),
  states: (id: number) =>
    httpClient.get<SimulationStateResponse[]>(`${simulationPath(id)}/states`),
  finish: (id: number) =>
    httpClient.post<SimulationResponse>(`${simulationPath(id)}/finish`),
  abandon: (id: number) =>
    httpClient.post<SimulationResponse>(`${simulationPath(id)}/abandon`),
  summary: (attemptId: number) =>
    httpClient.get<AttemptSummaryResponse>(
      `${apiEndpoints.attempts}/${attemptId}/summary`
    ),
} as const;
