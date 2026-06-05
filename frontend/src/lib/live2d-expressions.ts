import type { EmotionalProfile } from "@/lib/simulator-clinical";
import type {
  DialogueOption,
  PatientLive2DModel,
  PsychologistVisualState,
} from "@/types";

const CLINICAL_LABELS: Record<string, string> = {
  neutral: "Neutral",
  sad: "Tristeza",
  smile: "Confianza",
  angry: "Irritación",
  anxious: "Ansiedad",
  alert: "Alerta / riesgo",
};

type ClinicalMood =
  | "neutral"
  | "sad"
  | "smile"
  | "angry"
  | "anxious"
  | "alert";

/** Umbrales más bajos en ambos avatares → más cambios de expresión en sesión. */
function profileToMood(
  profile: EmotionalProfile,
  modelId?: PatientLive2DModel
): ClinicalMood {
  const { anxiety, stability, therapeuticAlliance, riskLevel, emotionalTension } =
    profile;
  const sensitive = modelId === "haru" || modelId === "natori";

  if (riskLevel >= (sensitive ? 68 : 78)) return "alert";
  if (riskLevel >= (sensitive ? 52 : 62) || emotionalTension >= (sensitive ? 70 : 80)) {
    return "angry";
  }
  if (anxiety >= (sensitive ? 55 : 68) || emotionalTension >= (sensitive ? 52 : 65)) {
    return "anxious";
  }
  if (
    therapeuticAlliance >= (sensitive ? 65 : 72) &&
    anxiety < (sensitive ? 58 : 55)
  ) {
    return "smile";
  }
  if (
    stability <= (sensitive ? 42 : 38) ||
    (anxiety >= (sensitive ? 50 : 58) &&
      therapeuticAlliance < (sensitive ? 52 : 50))
  ) {
    return "sad";
  }
  return "neutral";
}

const NATORI_BY_MOOD: Record<ClinicalMood, string> = {
  neutral: "Normal",
  sad: "Sad",
  smile: "Smile",
  angry: "Angry",
  anxious: "Blushing",
  alert: "Surprised",
};

/**
 * Haru F01–F08 (Cubism sample). Expresiones más marcadas que F02/F06 suaves.
 * F05 = sonrisa, F03 = enfado/tristeza fuerte, F07 = rubor (ansiedad), F08 = sorpresa.
 */
const HARU_BY_MOOD: Record<ClinicalMood, string> = {
  neutral: "F01",
  sad: "F03",
  smile: "F05",
  angry: "F04",
  anxious: "F07",
  alert: "F08",
};

export function mapProfileToLive2dExpression(
  profile: EmotionalProfile,
  modelId: PatientLive2DModel = "natori"
): string {
  const mood = profileToMood(profile, modelId);
  const map = modelId === "haru" ? HARU_BY_MOOD : NATORI_BY_MOOD;
  return map[mood];
}

const PSYCHOLOGIST_NATORI: Record<PsychologistVisualState, string> = {
  escucha_activa: "Normal",
  empatia: "Smile",
  reflexion: "Normal",
  validacion: "Smile",
  intervencion: "Normal",
  observacion: "Normal",
};

const PSYCHOLOGIST_HARU: Record<PsychologistVisualState, string> = {
  escucha_activa: "F01",
  empatia: "F05",
  reflexion: "F04",
  validacion: "F05",
  intervencion: "F02",
  observacion: "F01",
};

export function categoryToPsychologistState(
  category?: DialogueOption["category"]
): PsychologistVisualState {
  switch (category) {
    case "explore":
      return "escucha_activa";
    case "assess":
      return "observacion";
    case "intervene":
      return "intervencion";
    case "close":
      return "validacion";
    default:
      return "escucha_activa";
  }
}

export function mapPsychologistStateToLive2dExpression(
  state: PsychologistVisualState,
  modelId: PatientLive2DModel
): string {
  const map = modelId === "haru" ? PSYCHOLOGIST_HARU : PSYCHOLOGIST_NATORI;
  return map[state];
}

export function getLive2dExpressionLabel(
  expression: string,
  modelId: PatientLive2DModel = "natori"
): string {
  const mood =
    Object.entries(modelId === "haru" ? HARU_BY_MOOD : NATORI_BY_MOOD).find(
      ([, exp]) => exp === expression
    )?.[0] ?? "neutral";
  return CLINICAL_LABELS[mood] ?? expression;
}

/** Aplica expresión Live2D con reintento para que el cambio sea visible. */
export function applyLive2dExpression(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  expressionName: string,
  modelId?: PatientLive2DModel
): void {
  if (!expressionName || !model?.expression) return;

  const run = () => {
    try {
      void model.expression(expressionName);
    } catch {
      // ignore
    }
  };

  if (modelId === "haru" || modelId === "natori") {
    const em = model.internalModel?.motionManager?.expressionManager;
    try {
      em?.stopAllExpressions?.();
    } catch {
      // ignore
    }
    run();
    requestAnimationFrame(run);
    return;
  }

  run();
}

/** Tras animaciones idle, vuelve a aplicar la emoción clínica. */
export function bindLive2dExpressionOnMotionFinish(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  getExpression: () => string,
  modelId: PatientLive2DModel
): () => void {
  const manager = model?.internalModel?.motionManager;
  if (!manager?.on) return () => {};

  const onFinish = () =>
    applyLive2dExpression(model, getExpression(), modelId);
  manager.on("motionFinish", onFinish);
  return () => manager.off?.("motionFinish", onFinish);
}
