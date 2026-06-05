/**
 * Contratos para artefactos pedagógicos de sesión.
 * Pensados para rellenarse por reglas locales hoy y por IA mañana sin cambiar layout.
 */

export interface ClinicalSessionSummary {
  title: string;
  factorsIdentified: string[];
  strengthsObserved: string[];
  closingNote?: string;
  /** true cuando el contenido proviene de un proveedor externo (IA/docente) */
  source?: "rules" | "ai" | "teacher";
}

export interface FormativeFeedbackSlot {
  title: string;
  observation: string;
  source?: "rules" | "ai" | "teacher";
  /** Reservado: comentario del docente en evaluaciones futuras */
  teacherComment?: string | null;
  /** Reservado: sugerencia generada por IA */
  aiSuggestion?: string | null;
}

/** Ranuras visuales que podrán alimentarse por IA sin mover paneles */
export interface ClinicalAiContentSlots {
  contextualInterpretation?: string | null;
  clinicalObservations?: string[] | null;
  sessionSummary?: ClinicalSessionSummary | null;
  formativeFeedback?: FormativeFeedbackSlot | null;
  pedagogicalSuggestions?: string[] | null;
}
