import type { EmotionalProfile } from "@/lib/simulator-clinical";
import { toPedagogicalSnapshot } from "@/lib/simulator-clinical";
import type { Scene, SimulationCase } from "@/types";

export interface NarrativeIndicator {
  key: string;
  label: string;
  value: number;
  narrative: string;
}

export interface PatientPedagogyContent {
  observations: string[];
  contextualInterpretation: string;
  indicators: NarrativeIndicator[];
}

function computeOpenness(profile: EmotionalProfile): number {
  return Math.round(
    Math.min(
      100,
      Math.max(
        0,
        profile.therapeuticAlliance * 0.45 +
          profile.stability * 0.35 +
          (100 - profile.emotionalTension) * 0.2
      )
    )
  );
}

function narrativeForMetric(
  key: string,
  value: number
): string {
  const band = (v: number) =>
    v >= 72 ? "alta" : v >= 48 ? "moderada" : v >= 28 ? "en desarrollo" : "baja";

  const narratives: Record<string, Record<string, string>> = {
    anxiety: {
      alta: "Activación emocional marcada ante estímulos estresores",
      moderada: "Ansiedad presente con momentos de contención",
      "en desarrollo": "Ligera inquietud, aún manejable en sesión",
      baja: "Regulación emocional relativamente estable",
    },
    confidence: {
      alta: "Mayor seguridad al compartir su experiencia",
      moderada: "Confianza en construcción dentro del vínculo",
      "en desarrollo": "Cautela al exponer contenidos personales",
      baja: "Reserva ante la relación terapéutica",
    },
    cooperation: {
      alta: "Colaboración activa con el proceso",
      moderada: "Participación con altibajos según el tema",
      "en desarrollo": "Cooperación condicionada al ritmo de la sesión",
      baja: "Distancia o resistencia a seguir el hilo clínico",
    },
    resistance: {
      alta: "Evitación o defensividad ante ciertos temas",
      moderada: "Ambivalencia al profundizar",
      "en desarrollo": "Apertura gradual con puntos de bloqueo",
      baja: "Disposición a explorar con relativa fluidez",
    },
    openness: {
      alta: "Expresión emocional con mayor espontaneidad",
      moderada: "Apertura selectiva según el momento clínico",
      "en desarrollo": "Exploración cuidadosa de experiencias internas",
      baja: "Comunicación contenida o circunscrita",
    },
  };

  const b = band(value);
  return narratives[key]?.[b] ?? "En observación durante la sesión";
}

export function buildNarrativeIndicators(
  profile: EmotionalProfile
): NarrativeIndicator[] {
  const snap = toPedagogicalSnapshot(profile);
  const openness = computeOpenness(profile);

  return [
    { key: "anxiety", label: "Ansiedad", value: snap.anxiety, narrative: narrativeForMetric("anxiety", snap.anxiety) },
    {
      key: "confidence",
      label: "Confianza",
      value: snap.confidence,
      narrative: narrativeForMetric("confidence", snap.confidence),
    },
    {
      key: "cooperation",
      label: "Cooperación",
      value: snap.cooperation,
      narrative: narrativeForMetric("cooperation", snap.cooperation),
    },
    {
      key: "resistance",
      label: "Resistencia",
      value: snap.resistance,
      narrative: narrativeForMetric("resistance", snap.resistance),
    },
    {
      key: "openness",
      label: "Apertura",
      value: openness,
      narrative: narrativeForMetric("openness", openness),
    },
  ];
}

export function buildClinicalObservations(profile: EmotionalProfile): string[] {
  const items: string[] = [];

  if (profile.emotionalTension >= 52) {
    items.push("Mantiene tensión corporal o postural defensiva");
  }
  if (profile.anxiety >= 58) {
    items.push("Muestra activación ansiosa al abordar temas estresores");
  }
  if (profile.therapeuticAlliance < 48) {
    items.push("Evita profundizar en algunos temas sensibles");
  } else if (profile.therapeuticAlliance >= 65) {
    items.push("Permite mayor elaboración emocional en la entrevista");
  }
  if (profile.stability <= 42) {
    items.push("Dificultad para sostener calma entre intervenciones");
  } else if (profile.stability >= 60) {
    items.push("Logra momentos de regulación durante la sesión");
  }
  if (profile.riskLevel >= 55) {
    items.push("Señales de malestar intenso que requieren contención");
  }
  if (profile.anxiety >= 50 && profile.therapeuticAlliance >= 50) {
    items.push("Ambivalencia entre buscar apoyo y protegerse emocionalmente");
  }

  if (items.length === 0) {
    items.push("Presentación contenida, en fase de evaluación del vínculo");
  }

  return [...new Set(items)].slice(0, 4);
}

const CASE_CONTEXT: Record<
  string,
  (profile: EmotionalProfile, scene?: Scene) => string
> = {
  "case-anxiety-001": (profile, scene) => {
    const academic =
      scene?.setting?.toLowerCase().includes("universit") ||
      scene?.narrative?.toLowerCase().includes("examen") ||
      scene?.narrative?.toLowerCase().includes("estudi");
    if (academic || profile.anxiety >= 50) {
      return "La consultante expresa síntomas asociados a presión académica y expectativas elevadas en su entorno universitario. El malestar se articula con dificultades de concentración y activación somática ante evaluaciones.";
    }
    return "El cuadro se relaciona con activación ansiosa persistente y factores de estrés académico-reciente, sin que ello implique un diagnóstico definitivo en esta simulación.";
  },
  "case-depression-002": (profile) => {
    if (profile.stability <= 40) {
      return "El consultante describe un estado de ánimo bajo vinculado a una pérdida reciente, con anhedonia parcial y alteración del descanso. La interpretación contextual orienta al duelo y al desgaste emocional acumulado.";
    }
    return "La narrativa apunta a un proceso de duelo con componentes depresivos leves; conviene explorar red de apoyo y ritmo de elaboración sin cerrar formulaciones prematuras.";
  },
  "case-crisis-003": (profile) => {
    if (profile.riskLevel >= 55) {
      return "En este momento clínico predominan señales de crisis y desarticulación del sistema de apoyo. La prioridad contextual es la contención y la evaluación de seguridad, no un etiquetado diagnóstico.";
    }
    return "El consultante presenta ideación y vulnerabilidad en contexto de crisis; la simulación enfatiza contención, validación y activación de recursos de apoyo.";
  },
  "case-family-004": (profile, scene) => {
    const family =
      scene?.narrative?.toLowerCase().includes("famil") ||
      scene?.setting?.toLowerCase().includes("famil");
    if (family || profile.emotionalTension >= 50) {
      return "El adolescente refiere distanciamiento y patrones de comunicación tensa en el sistema familiar. La evitación conductual aparece como estrategia de manejo del conflicto relacional.";
    }
    return "La problemática se inscribe en dinámicas familiares y comunicación disfuncional; la sesión busca comprender roles y distanciamiento sin pathologizar al consultante.";
  },
};

export function buildContextualInterpretation(
  caseItem: SimulationCase,
  profile: EmotionalProfile,
  scene?: Scene
): string {
  const fn = CASE_CONTEXT[caseItem.id];
  if (fn) return fn(profile, scene);
  return caseItem.description;
}

export function buildPatientPedagogy(
  caseItem: SimulationCase,
  profile: EmotionalProfile,
  scene?: Scene
): PatientPedagogyContent {
  return {
    observations: buildClinicalObservations(profile),
    contextualInterpretation: buildContextualInterpretation(caseItem, profile, scene),
    indicators: buildNarrativeIndicators(profile),
  };
}
