import type { PageRequest } from "@/types/page";

type QueryValue = string | number | boolean | undefined | null;

export interface CaseResponse {
  id: number;
  titulo: string;
  descripcion: string | null;
  objetivo: string | null;
  nivelDificultad: string;
  duracionEstimada: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CaseRequest {
  titulo: string;
  descripcion?: string | null;
  objetivo?: string | null;
  nivelDificultad: string;
  duracionEstimada: number;
}

export interface CaseFilters extends PageRequest {
  [key: string]: QueryValue;
  activo?: boolean;
  search?: string;
}

export interface SceneResponse {
  id: number;
  casoId: number;
  orden: number;
  titulo: string;
  descripcion: string | null;
  contenido: string;
  activo: boolean;
}

export interface SceneRequest {
  orden: number;
  titulo: string;
  descripcion?: string | null;
  contenido: string;
  activo?: boolean | null;
}

export interface QuestionResponse {
  id: number;
  escenaId: number;
  enunciado: string;
  obligatoria: boolean;
  activo: boolean;
}

export interface QuestionRequest {
  enunciado: string;
  obligatoria?: boolean | null;
  activo?: boolean | null;
}

export interface OptionResponse {
  id: number;
  preguntaId: number;
  texto: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
}

export interface OptionRequest {
  texto: string;
  descripcion?: string | null;
  orden: number;
  activo?: boolean | null;
}

export interface ToolResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  activo: boolean;
}

export interface InstitutionalEntityResponse {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  activo: boolean;
}

export interface BuilderQuestionResponse {
  pregunta: QuestionResponse;
  opciones: OptionResponse[];
}

export interface BuilderSceneResponse {
  escena: SceneResponse;
  preguntas: BuilderQuestionResponse[];
}

export interface CaseBuilderResponse {
  caso: CaseResponse;
  escenas: BuilderSceneResponse[];
  herramientas: ToolResponse[];
  entidades: InstitutionalEntityResponse[];
}
