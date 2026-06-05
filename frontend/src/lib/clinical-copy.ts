/** Terminología clínica inmersiva — fuente única para toda la plataforma */
export const clinicalCopy = {
  cases: "Expedientes clínicos",
  case: "Expediente clínico",
  tasks: "Sesiones asignadas",
  task: "Sesión asignada",
  evaluations: "Análisis clínico",
  evaluation: "Análisis clínico",
  feedback: "Retroalimentación terapéutica",
  students: "Participantes clínicos",
  student: "Participante clínico",
  decisions: "Intervenciones clínicas",
  decision: "Intervención clínica",
  simulator: "Simulador clínico",
  session: "Sesión terapéutica",
  catalog: "Repositorio de expedientes",
  progress: "Progreso clínico",
  competencies: "Competencias terapéuticas",
} as const;

export const clinicalInsights = {
  teacher: [
    {
      id: "i1",
      severity: "warning" as const,
      message: "3 participantes requieren seguimiento prioritario.",
      detail: "Riesgo clínico elevado detectado en simulaciones recientes.",
    },
    {
      id: "i2",
      severity: "info" as const,
      message: "El Grupo B presenta baja consistencia emocional.",
      detail: "Variabilidad alta en indicadores de alianza terapéutica.",
    },
    {
      id: "i3",
      severity: "alert" as const,
      message: "Se detectó aumento de riesgo clínico esta semana.",
      detail: "+18% en protocolos de crisis respecto al periodo anterior.",
    },
  ],
  student: [
    {
      id: "s1",
      severity: "info" as const,
      message: "Tu alianza terapéutica mejoró un 12% esta semana.",
      detail: "Continúa reforzando la exploración emocional en sesión.",
    },
    {
      id: "s2",
      severity: "success" as const,
      message: "Competencia destacada: comunicación terapéutica.",
      detail: "Superaste el promedio del cohorte en las últimas 2 simulaciones.",
    },
  ],
};

export const therapeuticCompetencies = [
  { id: "active-listening", label: "Escucha activa", value: 82, level: "Avanzado" },
  { id: "clinical-empathy", label: "Empatía clínica", value: 78, level: "Consolidado" },
  { id: "risk-assessment", label: "Evaluación de riesgo", value: 71, level: "En desarrollo" },
  { id: "therapeutic-comms", label: "Comunicación terapéutica", value: 85, level: "Destacado" },
] as const;
