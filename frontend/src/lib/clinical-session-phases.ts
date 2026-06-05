import type { Scene, SimulationSession } from "@/types";
import type { DialogueOption } from "@/types";

export type SessionPhaseId =
  | "inicio"
  | "exploracion"
  | "profundizacion"
  | "intervencion"
  | "sintesis"
  | "cierre";

export type PhaseStatus = "completed" | "current" | "pending";

export interface SessionPhaseStep {
  id: SessionPhaseId;
  label: string;
  status: PhaseStatus;
}

export const SESSION_PHASE_DEFINITIONS: { id: SessionPhaseId; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "exploracion", label: "Exploración" },
  { id: "profundizacion", label: "Profundización" },
  { id: "intervencion", label: "Intervención" },
  { id: "sintesis", label: "Síntesis" },
  { id: "cierre", label: "Cierre" },
];

function lastOptionCategory(
  session: SimulationSession,
  scenes: Scene[]
): DialogueOption["category"] | undefined {
  const last = session.decisions[session.decisions.length - 1];
  if (!last) return undefined;
  const scene = scenes.find((s) => s.id === last.sceneId);
  return scene?.options.find((o) => o.id === last.optionId)?.category;
}

export function resolveCurrentPhaseIndex(
  session: SimulationSession | null,
  scenes: Scene[],
  currentScene: Scene | undefined,
  isComplete: boolean
): number {
  if (isComplete) return 5;
  if (!session || !currentScene) return 0;

  const title = currentScene.title.toLowerCase();
  const setting = currentScene.setting.toLowerCase();
  const sceneId = currentScene.id.toLowerCase();

  if (
    sceneId.includes("end") ||
    sceneId.includes("resumen") ||
    setting.includes("resumen")
  ) {
    return 5;
  }

  if (
    title.includes("síntesis") ||
    title.includes("sintesis") ||
    sceneId.includes("scene-3")
  ) {
    return 4;
  }

  const category = lastOptionCategory(session, scenes);
  if (category === "close") return 5;
  if (category === "intervene") return 3;

  if (title.includes("profund") || sceneId.includes("2a")) {
    return 2;
  }

  if (category === "explore") {
    return session.decisions.length >= 2 ? 2 : 1;
  }

  if (category === "assess") return 1;

  if (session.decisions.length === 0) return 0;

  if (session.decisions.length >= 2) return 2;

  return 1;
}

export function buildSessionPhaseTimeline(
  session: SimulationSession | null,
  scenes: Scene[],
  currentScene: Scene | undefined,
  isComplete: boolean
): SessionPhaseStep[] {
  const currentIndex = resolveCurrentPhaseIndex(
    session,
    scenes,
    currentScene,
    isComplete
  );

  return SESSION_PHASE_DEFINITIONS.map((phase, index) => ({
    ...phase,
    status:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "pending",
  }));
}
