import {
  getEmotionalProfileAtStep,
  toPedagogicalSnapshot,
  type PedagogicalStateSnapshot,
} from "@/lib/simulator-clinical";
import type { Scene, SimulationSession } from "@/types";

export interface ClinicalImpactDelta {
  label: string;
  delta: number;
}

const IMPACT_METRIC_ORDER: (keyof PedagogicalStateSnapshot)[] = [
  "anxiety",
  "confidence",
  "cooperation",
  "resistance",
  "alliance",
];

/** Menor ansiedad/resistencia = positivo; mayor confianza/cooperación/alianza = positivo */
function isPositiveMetric(key: keyof PedagogicalStateSnapshot, delta: number): boolean {
  if (key === "anxiety" || key === "resistance") return delta < 0;
  return delta > 0;
}

const METRIC_LABELS: Record<keyof PedagogicalStateSnapshot, string> = {
  anxiety: "Ansiedad",
  confidence: "Confianza",
  cooperation: "Cooperación",
  resistance: "Resistencia",
  alliance: "Alianza",
};

export function formatImpactDelta(key: keyof PedagogicalStateSnapshot, delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "" : "";
  return `${METRIC_LABELS[key]} ${sign}${delta}%`;
}

export function computeImpactAfterDecision(
  session: SimulationSession,
  scenes: Scene[],
  caseId: string,
  decisionIndex: number
): ClinicalImpactDelta[] {
  const decision = session.decisions[decisionIndex];
  if (!decision) return [];

  const option = scenes
    .find((s) => s.id === decision.sceneId)
    ?.options.find((o) => o.id === decision.optionId);
  if (!option) return [];

  const before = toPedagogicalSnapshot(
    getEmotionalProfileAtStep(
      session,
      decisionIndex,
      decision.sceneId,
      caseId
    )
  );
  const after = toPedagogicalSnapshot(
    getEmotionalProfileAtStep(
      session,
      decisionIndex + 1,
      option.nextSceneId,
      caseId
    )
  );

  const deltas: ClinicalImpactDelta[] = [];

  for (const key of IMPACT_METRIC_ORDER) {
    const delta = after[key] - before[key];
    if (delta === 0) continue;
    deltas.push({
      label: formatImpactDelta(key, delta),
      delta: isPositiveMetric(key, delta) ? Math.abs(delta) : -Math.abs(delta),
    });
  }

  return deltas.slice(0, 4);
}
