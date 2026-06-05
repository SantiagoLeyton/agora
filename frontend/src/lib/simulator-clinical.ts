import type { SimulationSession, Scene, DialogueOption } from "@/types";

export interface EmotionalProfile {
  anxiety: number;
  stability: number;
  therapeuticAlliance: number;
  riskLevel: number;
  emotionalTension: number;
}

export interface TimelineEvent {
  id: string;
  label: string;
  description: string;
  type: "decision" | "milestone" | "shift";
  timestamp: string;
}

export interface DecisionPathNode {
  id: string;
  label: string;
  category?: DialogueOption["category"];
  isActive?: boolean;
  isCurrent?: boolean;
}

const categoryLabels: Record<string, string> = {
  explore: "Exploración emocional",
  assess: "Evaluación clínica",
  intervene: "Intervención terapéutica",
  close: "Cierre de sesión",
};

const caseEmotionalBaselines: Record<
  string,
  Pick<
    EmotionalProfile,
    | "anxiety"
    | "stability"
    | "therapeuticAlliance"
    | "riskLevel"
    | "emotionalTension"
  >
> = {
  "case-anxiety-001": {
    anxiety: 58,
    stability: 62,
    therapeuticAlliance: 42,
    riskLevel: 24,
    emotionalTension: 52,
  },
  "case-depression-002": {
    anxiety: 44,
    stability: 34,
    therapeuticAlliance: 50,
    riskLevel: 30,
    emotionalTension: 48,
  },
  "case-crisis-003": {
    anxiety: 72,
    stability: 38,
    therapeuticAlliance: 32,
    riskLevel: 68,
    emotionalTension: 78,
  },
  "case-family-004": {
    anxiety: 48,
    stability: 52,
    therapeuticAlliance: 38,
    riskLevel: 16,
    emotionalTension: 58,
  },
};

function getSceneModifiers(sceneId?: string): Partial<EmotionalProfile> {
  const id = sceneId ?? "";
  if (id.includes("crisis") || id.includes("risk")) {
    return { riskLevel: 12, emotionalTension: 10, anxiety: 8 };
  }
  if (id.includes("2a") || id.includes("explor")) {
    return { anxiety: -6, therapeuticAlliance: 8, emotionalTension: -5 };
  }
  if (id.includes("end-premature") || id.includes("2c")) {
    return { therapeuticAlliance: -14, emotionalTension: 12, anxiety: 6 };
  }
  if (id.includes("end-success") || id.includes("scene-3")) {
    return { therapeuticAlliance: 10, anxiety: -8, emotionalTension: -10 };
  }
  return {};
}

/** Métricas pedagógicas visibles tras cada intervención (sin nueva API). */
export interface PedagogicalStateSnapshot {
  anxiety: number;
  confidence: number;
  cooperation: number;
  resistance: number;
  alliance: number;
}

export function toPedagogicalSnapshot(
  profile: EmotionalProfile
): PedagogicalStateSnapshot {
  const confidence = Math.round(
    Math.min(
      100,
      Math.max(
        0,
        profile.therapeuticAlliance * 0.55 +
          (100 - profile.anxiety) * 0.25 +
          profile.stability * 0.2
      )
    )
  );
  return {
    anxiety: profile.anxiety,
    confidence,
    cooperation: profile.therapeuticAlliance,
    resistance: Math.min(100, profile.emotionalTension),
    alliance: profile.therapeuticAlliance,
  };
}

export function getEmotionalProfileAtStep(
  session: SimulationSession,
  decisionCount: number,
  sceneId: string,
  caseId: string
): EmotionalProfile {
  const partial: SimulationSession = {
    ...session,
    decisions: session.decisions.slice(0, decisionCount),
    currentSceneId: sceneId,
  };
  return getEmotionalProfile(partial, sceneId, caseId);
}

export function getEmotionalProfile(
  session: SimulationSession | null,
  sceneId?: string,
  caseId?: string
): EmotionalProfile {
  const n = session?.decisions.length ?? 0;
  const base =
    caseEmotionalBaselines[caseId ?? ""] ??
    caseEmotionalBaselines["case-anxiety-001"];
  const scene = getSceneModifiers(sceneId);

  const anxiety = Math.min(
    (base.anxiety + n * 7 + (scene.anxiety ?? 0)),
    92
  );
  const stability = Math.max(
    base.stability - n * 5 + (scene.stability ?? 0),
    22
  );
  const therapeuticAlliance = Math.min(
    base.therapeuticAlliance + n * 10 + (scene.therapeuticAlliance ?? 0),
    94
  );
  const riskLevel = Math.min(
    base.riskLevel + n * 6 + (scene.riskLevel ?? 0),
    88
  );
  const emotionalTension = Math.min(
    base.emotionalTension + n * 8 + (scene.emotionalTension ?? 0),
    85
  );

  return {
    anxiety,
    stability,
    therapeuticAlliance,
    riskLevel,
    emotionalTension,
  };
}

export function getTimelineEvents(
  session: SimulationSession | null,
  scenes: Scene[]
): TimelineEvent[] {
  if (!session) return [];

  const events: TimelineEvent[] = [
    {
      id: "start",
      label: "Inicio de sesión",
      description: "Apertura del expediente clínico",
      type: "milestone",
      timestamp: session.startedAt,
    },
  ];

  session.decisions.forEach((d, i) => {
    const scene = scenes.find((s) => s.id === d.sceneId);
    const opt = scene?.options.find((o) => o.id === d.optionId);
    events.push({
      id: d.optionId,
      label: opt?.label ?? `Intervención ${i + 1}`,
      description: categoryLabels[opt?.category ?? ""] ?? "Momento narrativo",
      type: i > 0 && i % 2 === 0 ? "shift" : "decision",
      timestamp: d.timestamp,
    });
  });

  return events;
}

export function getDecisionPathNodes(
  session: SimulationSession | null,
  scenes: Scene[],
  currentSceneId?: string
): DecisionPathNode[] {
  if (!session) return [];

  const nodes: DecisionPathNode[] = session.decisions.map((d, i) => {
    const scene = scenes.find((s) => s.id === d.sceneId);
    const opt = scene?.options.find((o) => o.id === d.optionId);
    return {
      id: d.optionId,
      label: opt?.label ?? `Paso ${i + 1}`,
      category: opt?.category,
      isActive: true,
      isCurrent: false,
    };
  });

  if (currentSceneId) {
    nodes.push({
      id: "current",
      label: "Momento presente",
      isActive: true,
      isCurrent: true,
    });
  }

  return nodes;
}
