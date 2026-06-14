import type { PageRequest } from "@/types/page";
import type { AttemptSummaryResponse, PedagogicalAnalysisResponse } from "@/types/simulation";

export interface GradebookFilters extends PageRequest {
  grupoId?: number;
  casoId?: number;
  estudianteId?: number;
  desde?: string;
  hasta?: string;
  estado?: string;
  notaMinima?: number;
  notaMaxima?: number;
}

export interface GradebookEntry {
  attemptId: number;
  estudianteId: number;
  estudianteNombre: string;
  estudianteCorreo: string;
  grupoId: number | null;
  grupoNombre: string | null;
  casoId: number;
  casoTitulo: string;
  programacionId: number | null;
  fechaPresentacion: string | null;
  estado: string;
  notaFinal: number | null;
  rdaCumplidos: number;
  rdaParciales: number;
  rdaPendientes: number;
  feedbackDocente: string | null;
  feedbackIa: string | null;
  aprobado: boolean;
}

export interface GradeDistributionItem {
  rango: string;
  cantidad: number;
}

export interface GradebookAnalytics {
  promedioCurso: number;
  mejorNota: number;
  peorNota: number;
  aprobados: number;
  reprobados: number;
  umbralAprobacion: number;
  distribucion: GradeDistributionItem[];
}

export interface GradebookHistoryItem {
  attemptId: number;
  fechaPresentacion: string | null;
  estado: string;
  notaFinal: number | null;
}

export interface GradebookDetail {
  entry: GradebookEntry;
  summary: AttemptSummaryResponse;
  analysis: PedagogicalAnalysisResponse;
  historial: GradebookHistoryItem[];
}

export type GradebookExportFormat = "csv" | "excel";
