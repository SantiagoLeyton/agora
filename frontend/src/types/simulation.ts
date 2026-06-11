import type {
  CaseResponse,
  SceneResponse,
} from "@/types/clinical-case";

export type SimulationStatus = "EN_PROCESO" | "FINALIZADO" | "ABANDONADO";

export interface StartSimulationRequest {
  casoId: number;
  programacionId?: number | null;
}

export interface SimulationStartedResponse {
  intentoId: number;
}

export interface AttemptResponse {
  id: number;
  estudianteId: number;
  casoId: number;
  programacionId: number | null;
  fechaInicio: string;
  fechaFin: string | null;
  estado: SimulationStatus;
}

export interface SimulationStateResponse {
  id: number;
  estadoEmocionalId: number;
  nombre: string;
  descripcion: string | null;
  valorMinimo: number;
  valorMaximo: number;
  valorActual: number;
  ultimaActualizacion: string;
}

export interface SimulationResponse {
  intento: AttemptResponse;
  caso: CaseResponse;
  escenaActual: SceneResponse | null;
  estados: SimulationStateResponse[];
}

export interface AnswerSimulationRequest {
  preguntaId: number;
  opcionId: number;
}

export interface AnswerResponse {
  respuestaId: number;
  intentoId: number;
  preguntaId: number;
  opcionId: number;
  mensaje: string | null;
  estados: SimulationStateResponse[];
}

export interface AttemptAnswerResponse {
  id: number;
  preguntaId: number;
  pregunta: string;
  opcionId: number;
  opcion: string;
  fechaRespuesta: string;
}

export interface JournalResponse {
  id: number;
  intentoId: number;
  titulo: string;
  contenido: string;
  fechaRegistro: string;
}

export interface FeedbackResponse {
  id: number;
  intentoId: number;
  autor: string;
  contenido: string;
  tiempoTotal: number | null;
  escenasCompletadas: number | null;
  observaciones: string | null;
  fechaGeneracion: string;
}

export interface AttemptSummaryResponse {
  intento: AttemptResponse;
  caso: CaseResponse;
  respuestas: AttemptAnswerResponse[];
  estados: SimulationStateResponse[];
  bitacoras: JournalResponse[];
  retroalimentaciones: FeedbackResponse[];
}

export interface AISummaryRequest {
  instrucciones?: string | null;
}

export interface AISummaryResponse {
  id: number;
  intentoId: number;
  promptUtilizado: string;
  respuestaGenerada: string;
  modeloUtilizado: string;
  fueExitosa: boolean;
  mensajeError: string | null;
  fechaGeneracion: string;
}

export interface AISummaryHistoryResponse {
  intentoId: number;
  sintesis: AISummaryResponse[];
}
