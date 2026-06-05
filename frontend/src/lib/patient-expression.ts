import type { EmotionalProfile } from "@/lib/simulator-clinical";

export type PatientExpression =
  | "neutral"
  | "sad"
  | "relieved"
  | "anxious"
  | "tense"
  | "alert";

export const patientExpressionLabels: Record<PatientExpression, string> = {
  neutral: "Neutral",
  sad: "Tristeza",
  relieved: "Confianza / alivio",
  anxious: "Ansiedad",
  tense: "Tensión / irritación",
  alert: "Alerta / riesgo",
};

export function mapProfileToPatientExpression(
  profile: EmotionalProfile
): PatientExpression {
  const { anxiety, stability, therapeuticAlliance, riskLevel, emotionalTension } =
    profile;

  if (riskLevel >= 78) return "alert";
  if (riskLevel >= 62 || emotionalTension >= 80) return "tense";
  if (anxiety >= 68 || emotionalTension >= 65) return "anxious";
  if (therapeuticAlliance >= 72 && anxiety < 55) return "relieved";
  if (stability <= 38 || (anxiety >= 58 && therapeuticAlliance < 50)) {
    return "sad";
  }

  return "neutral";
}
