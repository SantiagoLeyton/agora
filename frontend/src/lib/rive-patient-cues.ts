/**
 * Maps simulator emotional metrics to cues available in a downloaded patient.riv
 * (animations / triggers) without requiring Rive Editor access.
 */

export type PatientEmotionKey =
  | "anxiety"
  | "therapeuticAlliance"
  | "riskLevel"
  | "emotionalTension"
  | "stability";

export type PatientEmotions = Partial<Record<PatientEmotionKey, number>>;

/** Name fragments often used in community avatar files (incl. patient.riv). */
const CUE_PATTERNS: Record<PatientEmotionKey, RegExp[]> = {
  anxiety: [/blush/i, /nervous/i, /worry/i, /stress/i, /anx/i],
  therapeuticAlliance: [/smile/i, /happy/i, /grin/i, /trust/i],
  riskLevel: [/shock/i, /fear/i, /panic/i, /alert/i],
  emotionalTension: [/blush/i, /tense/i, /strain/i],
  stability: [/head bop/i, /headbop/i, /idle/i, /bop/i, /neutral/i],
};

function normalizePercent(v: number | undefined): number {
  if (typeof v !== "number" || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function findByPatterns(names: string[], patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const hit = names.find((n) => pattern.test(n));
    if (hit) return hit;
  }
  return undefined;
}

/** Highest “salient” emotion (above 55) for discrete avatar reactions. */
export function pickDominantEmotion(
  emotions: PatientEmotions
): PatientEmotionKey | null {
  const ranked: Array<{ key: PatientEmotionKey; value: number }> = [
    { key: "riskLevel", value: normalizePercent(emotions.riskLevel) },
    { key: "anxiety", value: normalizePercent(emotions.anxiety) },
    { key: "emotionalTension", value: normalizePercent(emotions.emotionalTension) },
    {
      key: "therapeuticAlliance",
      value: normalizePercent(emotions.therapeuticAlliance),
    },
    { key: "stability", value: normalizePercent(emotions.stability) },
  ];

  ranked.sort((a, b) => b.value - a.value);
  const top = ranked[0];
  if (!top || top.value < 55) return null;
  return top.key;
}

/**
 * Picks an animation name present in the file that best matches current emotions.
 * Used when the .riv has no numeric SM inputs (typical for downloaded assets).
 */
export function resolveAnimationCue(
  animationNames: string[],
  emotions: PatientEmotions
): string | undefined {
  if (animationNames.length === 0) return undefined;

  const dominant = pickDominantEmotion(emotions);
  if (dominant) {
    const fromDominant = findByPatterns(animationNames, CUE_PATTERNS[dominant]);
    if (fromDominant) return fromDominant;
  }

  const anxiety = normalizePercent(emotions.anxiety);
  const alliance = normalizePercent(emotions.therapeuticAlliance);
  const stability = normalizePercent(emotions.stability);

  if (anxiety >= 60) {
    return findByPatterns(animationNames, CUE_PATTERNS.anxiety);
  }
  if (alliance >= 65) {
    return findByPatterns(animationNames, CUE_PATTERNS.therapeuticAlliance);
  }
  if (stability >= 50) {
    return findByPatterns(animationNames, CUE_PATTERNS.stability);
  }

  return animationNames[0];
}

export function inputTypeLabel(type: unknown): string {
  if (type === 56 || type === "number" || type === "Number") return "number";
  if (type === 58 || type === "trigger" || type === "Trigger") return "trigger";
  if (type === 59 || type === "boolean" || type === "Boolean") return "boolean";
  return String(type ?? "?");
}

export function isTriggerInput(type: unknown): boolean {
  return type === 58 || type === "trigger" || type === "Trigger";
}

export function isBooleanInput(type: unknown): boolean {
  return type === 59 || type === "boolean" || type === "Boolean";
}
