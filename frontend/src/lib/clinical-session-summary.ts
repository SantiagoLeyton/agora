import type { ClinicalSessionSummary, FormativeFeedbackSlot } from "@/types/clinical-session-artifacts";
import type { EmotionalProfile } from "@/lib/simulator-clinical";
import type { ClinicalDialogueTurn } from "@/lib/clinical-dialogue";
import type { Scene, SimulationCase, SimulationSession } from "@/types";

const CASE_FACTORS: Record<string, string[]> = {
  "case-anxiety-001": [
    "Presión académica y evaluaciones próximas.",
    "Expectativas elevadas en el entorno familiar o personal.",
    "Pensamientos anticipatorios negativos.",
    "Activación somática (tensión, sueño alterado).",
  ],
  "case-depression-002": [
    "Pérdida reciente y proceso de duelo.",
    "Anhedonia parcial y baja energía.",
    "Alteración del patrón de sueño.",
  ],
  "case-crisis-003": [
    "Ideación o malestar intenso en contexto de crisis.",
    "Desarticulación parcial del sistema de apoyo.",
    "Necesidad de contención y evaluación de seguridad.",
  ],
  "case-family-004": [
    "Comunicación tensa en el sistema familiar.",
    "Distanciamiento y evitación conductual.",
    "Roles o expectativas poco flexibles en casa.",
  ],
};

function pickStrengths(profile: EmotionalProfile, decisionCount: number): string[] {
  const strengths: string[] = [];
  if (profile.therapeuticAlliance >= 50) {
    strengths.push("Disposición al diálogo.");
  }
  if (profile.stability >= 45) {
    strengths.push("Capacidad reflexiva en momentos de la sesión.");
  }
  if (profile.therapeuticAlliance >= 60 || decisionCount >= 2) {
    strengths.push("Apertura progresiva al explorar temas sensibles.");
  }
  if (profile.anxiety < 55 && decisionCount >= 1) {
    strengths.push("Regulación relativa al abordar estresores.");
  }
  if (strengths.length === 0) {
    strengths.push("Presencia en sesión y disposición inicial al contacto.");
  }
  return [...new Set(strengths)].slice(0, 4);
}

export function buildClinicalSessionSummary(
  caseItem: SimulationCase,
  session: SimulationSession,
  profile: EmotionalProfile,
  _turns: ClinicalDialogueTurn[],
  _scenes: Scene[]
): ClinicalSessionSummary {
  const factors =
    CASE_FACTORS[caseItem.id]?.slice(0, 4) ?? [
      "Factores contextuales vinculados al motivo de consulta.",
      "Patrones emocionales y conductuales observados en sesión.",
    ];

  return {
    title: "Resumen clínico",
    factorsIdentified: factors,
    strengthsObserved: pickStrengths(profile, session.decisions.length),
    closingNote:
      "Este resumen es formativo y no constituye diagnóstico ni evaluación clínica definitiva.",
    source: "rules",
  };
}

export function buildFormativeFeedbackPreview(
  session: SimulationSession,
  profile: EmotionalProfile,
  turns: ClinicalDialogueTurn[]
): FormativeFeedbackSlot {
  const exploreCount = session.decisions.length;
  const lastPatient = [...turns].reverse().find((t) => t.role === "patient");
  const allianceHigh = profile.therapeuticAlliance >= 55;

  let observation =
    "Las intervenciones realizadas permitieron sostener el contacto terapéutico; conviene seguir ajustando el ritmo según la respuesta del consultante.";

  if (allianceHigh && exploreCount >= 2) {
    observation =
      "La intervención favoreció la exploración emocional y aumentó la cooperación del consultante en la segunda parte de la sesión.";
  } else if (profile.emotionalTension >= 60) {
    observation =
      "Se observó tensión persistente; en próximas sesiones conviene reforzar validación antes de profundizar en contenidos sensibles.";
  } else if (lastPatient?.impactDeltas?.some((d) => d.delta > 0)) {
    observation =
      "La última intervención generó cambios favorables en indicadores de confianza o cooperación.";
  }

  return {
    title: "Observación pedagógica",
    observation,
    source: "rules",
    teacherComment: null,
    aiSuggestion: null,
  };
}
