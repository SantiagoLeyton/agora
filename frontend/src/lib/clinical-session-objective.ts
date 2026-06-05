import type { Scene, SimulationCase, SimulationSession } from "@/types";
import { resolveCurrentPhaseIndex, SESSION_PHASE_DEFINITIONS } from "@/lib/clinical-session-phases";

const PHASE_OBJECTIVES: Record<string, string> = {
  inicio:
    "Establecer contacto terapéutico, recoger motivo de consulta y crear un marco seguro para la entrevista.",
  exploracion:
    "Explorar la experiencia subjetiva del consultante y los factores que sostienen el malestar actual.",
  profundizacion:
    "Profundizar en detonantes, emociones asociadas y patrones de afrontamiento sin forzar el ritmo del consultante.",
  intervencion:
    "Aplicar una intervención acorde al momento clínico y observar su efecto en el vínculo y la regulación emocional.",
  sintesis:
    "Integrar lo trabajado en sesión, validar avances y acordar focos para continuidad del proceso.",
  cierre:
    "Cerrar la sesión con contención, claridad sobre lo acordado y señales de continuidad terapéutica.",
};

const CASE_OBJECTIVE_OVERRIDES: Record<
  string,
  Partial<Record<string, string>>
> = {
  "case-anxiety-001": {
    exploracion:
      "Explorar factores académicos asociados a la ansiedad y comprender los detonantes principales del malestar.",
    profundizacion:
      "Profundizar en la cadena pensamiento–emoción–conducta vinculada a evaluaciones y expectativas de desempeño.",
    intervencion:
      "Introducir estrategias de regulación o reencuadre que reduzcan la activación ansiosa sin invalidar la experiencia.",
  },
  "case-depression-002": {
    exploracion:
      "Explorar el duelo reciente, la red de apoyo y los cambios en ánimo, sueño y motivación.",
    profundizacion:
      "Comprender cómo el consultante elabora la pérdida y qué recursos personales utiliza para afrontarla.",
  },
  "case-crisis-003": {
    inicio:
      "Garantizar contención emocional y evaluar seguridad antes de profundizar en contenidos sensibles.",
    intervencion:
      "Priorizar estabilización, validación y activación de recursos de apoyo inmediato.",
  },
  "case-family-004": {
    exploracion:
      "Explorar dinámicas familiares, comunicación y el significado del distanciamiento para el adolescente.",
  },
};

function sceneObjectiveHint(scene?: Scene): string | undefined {
  if (!scene) return undefined;
  const t = scene.title.toLowerCase();
  if (t.includes("primera") || t.includes("inicial")) {
    return PHASE_OBJECTIVES.inicio;
  }
  if (t.includes("explor")) return CASE_OBJECTIVE_OVERRIDES["case-anxiety-001"]?.exploracion;
  if (t.includes("profund")) return PHASE_OBJECTIVES.profundizacion;
  if (t.includes("anamnesis") || t.includes("evalu")) {
    return "Recopilar antecedentes relevantes y factores contextuales sin emitir juicios diagnósticos prematuros.";
  }
  return undefined;
}

export function getCurrentClinicalObjective(
  caseItem: SimulationCase,
  session: SimulationSession | null,
  scenes: Scene[],
  currentScene: Scene | undefined,
  isComplete: boolean
): { phaseLabel: string; objective: string } {
  const index = resolveCurrentPhaseIndex(session, scenes, currentScene, isComplete);
  const phase = SESSION_PHASE_DEFINITIONS[index];
  const caseOverrides = CASE_OBJECTIVE_OVERRIDES[caseItem.id];
  const override = caseOverrides?.[phase.id];
  const sceneHint = sceneObjectiveHint(currentScene);

  return {
    phaseLabel: phase.label,
    objective:
      override ??
      sceneHint ??
      PHASE_OBJECTIVES[phase.id] ??
      PHASE_OBJECTIVES.exploracion,
  };
}
