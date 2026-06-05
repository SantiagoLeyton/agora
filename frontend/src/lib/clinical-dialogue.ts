import { computeImpactAfterDecision } from "@/lib/clinical-impact";
import type { ClinicalImpactDelta } from "@/lib/clinical-impact";
import type { Scene, SimulationSession } from "@/types";

export type ClinicalDialogueRole = "psychologist" | "patient";

export interface ClinicalDialogueTurn {
  id: string;
  role: ClinicalDialogueRole;
  speakerName: string;
  text: string;
  timestamp?: string;
  /** Evolución pedagógica tras respuesta del paciente */
  impactDeltas?: ClinicalImpactDelta[];
}

function findOption(scenes: Scene[], sceneId: string, optionId: string) {
  const scene = scenes.find((s) => s.id === sceneId);
  return scene?.options.find((o) => o.id === optionId);
}

/**
 * Historial conversacional derivado de sesión y escenas (sin tocar APIs ni narrativa).
 */
export function buildClinicalDialogueHistory(
  session: SimulationSession | null,
  scenes: Scene[],
  currentScene: Scene | undefined,
  psychologistName: string,
  caseId: string
): ClinicalDialogueTurn[] {
  if (!session || !currentScene || scenes.length === 0) return [];

  const sceneMap = new Map(scenes.map((s) => [s.id, s]));
  const turns: ClinicalDialogueTurn[] = [];

  if (session.decisions.length === 0) {
    if (currentScene.speakerRole === "patient") {
      turns.push({
        id: `pat-${currentScene.id}`,
        role: "patient",
        speakerName: currentScene.speaker,
        text: currentScene.narrative,
      });
    }
    return turns;
  }

  const opening = scenes[0];
  if (opening?.speakerRole === "patient") {
    turns.push({
      id: `pat-opening-${opening.id}`,
      role: "patient",
      speakerName: opening.speaker,
      text: opening.narrative,
    });
  }

  session.decisions.forEach((decision, decisionIndex) => {
    const option = findOption(scenes, decision.sceneId, decision.optionId);
    if (!option) return;

    turns.push({
      id: `psy-${decision.sceneId}-${decision.optionId}`,
      role: "psychologist",
      speakerName: psychologistName,
      text: option.description
        ? `${option.label}. ${option.description}`
        : option.label,
      timestamp: decision.timestamp,
    });

    const responseScene = sceneMap.get(option.nextSceneId);
    if (responseScene?.speakerRole === "patient") {
      turns.push({
        id: `pat-${option.nextSceneId}-${decision.timestamp}`,
        role: "patient",
        speakerName: responseScene.speaker,
        text: responseScene.narrative,
        timestamp: decision.timestamp,
        impactDeltas: computeImpactAfterDecision(
          session,
          scenes,
          caseId,
          decisionIndex
        ),
      });
    }
  });

  const lastTurn = turns[turns.length - 1];
  const lastDecision = session.decisions[session.decisions.length - 1];
  const lastOption = lastDecision
    ? findOption(scenes, lastDecision.sceneId, lastDecision.optionId)
    : undefined;
  const lastResponseId = lastOption?.nextSceneId;

  if (
    currentScene.speakerRole === "patient" &&
    (lastResponseId !== currentScene.id ||
      lastTurn?.text !== currentScene.narrative)
  ) {
    const duplicate =
      lastTurn?.role === "patient" && lastTurn.text === currentScene.narrative;
    if (!duplicate) {
      turns.push({
        id: `pat-current-${currentScene.id}`,
        role: "patient",
        speakerName: currentScene.speaker,
        text: currentScene.narrative,
      });
    }
  }

  return turns;
}
