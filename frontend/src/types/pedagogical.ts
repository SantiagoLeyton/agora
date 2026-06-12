export type RdaComplianceStatus =
  | "CUMPLIDO"
  | "PARCIALMENTE_CUMPLIDO"
  | "NO_EVIDENCIADO";

export interface RdaEvaluationItem {
  rdaId: number;
  orden: number;
  descripcion: string;
  puntosObtenidos: number;
  puntosMaximos: number;
  compliancePct: number;
  nota: number;
  estado: RdaComplianceStatus;
  preguntasEvaluadas: number;
  preguntasTotales: number;
}

export interface RdaAttemptEvaluation {
  attemptId: number;
  casoId: number;
  resultados: RdaEvaluationItem[];
}

export interface AcademicProgressAttempt {
  attemptId: number;
  casoId: number;
  casoTitulo: string;
  fechaFin: string | null;
  notaFinal: number | null;
  feedbackCount: number;
  aiSummaryCount: number;
  rdaEvaluations: RdaEvaluationItem[];
  estados: Array<{
    nombre: string;
    valorActual: number;
  }>;
}

export interface RdaTrendPoint {
  rdaId: number;
  descripcion: string;
  samples: Array<{
    attemptId: number;
    fechaFin: string | null;
    compliancePct: number;
    estado: RdaComplianceStatus;
  }>;
}

export interface AcademicProgressResponse {
  studentId: number;
  studentName: string;
  attempts: AcademicProgressAttempt[];
  rdaTrends: RdaTrendPoint[];
}

export interface PedagogicalInsights {
  averageGrade: number | null;
  rdaSummary: Array<{
    descripcion: string;
    avgCompliancePct: number;
    sampleSize: number;
  }>;
  studentsRequiringAttention: Array<{
    studentId: number;
    studentName: string;
    latestGrade: number | null;
    gradeTrend: number | null;
  }>;
  positiveProgressStudents: Array<{
    studentId: number;
    studentName: string;
    latestGrade: number | null;
    gradeTrend: number | null;
  }>;
}
