import type { Live2DParticipantRole, PatientLive2DModel } from "@/types";

/**
 * Encuadre busto (torso hacia arriba) en el panel clínico.
 * Usa internalModel.getSize() — no model.width/height de Pixi.
 */

const DEFAULT_CANVAS = { width: 500, height: 500 } as const;

/** Región visible: cabeza + torso superior */
const BUST_LAYOUT: Record<
  PatientLive2DModel,
  {
    anchorY: number;
    heightRatio: number;
    widthRatio: number;
    positionY: number;
    /** Ajuste extra de zoom (Natori artboard 500×500 ya es busto; sin boost se ve lejos). */
    scaleBoost?: number;
    marginPreview?: number;
    marginPlay?: number;
  }
> = {
  /** Natori: artboard busto; ratios cercanos a Haru para mismo encuadre torso-arriba */
  natori: {
    anchorY: 0.32,
    heightRatio: 0.48,
    widthRatio: 0.58,
    positionY: 0.56,
    scaleBoost: 1.1,
    marginPreview: 0.96,
    marginPlay: 1.0,
  },
  /** Haru: cuerpo completo; encuadre parte superior */
  haru: {
    anchorY: 0.2,
    heightRatio: 0.46,
    widthRatio: 0.58,
    positionY: 0.52,
  },
};

export function getNatoriCanvasSize(model: {
  internalModel?: { getSize?: () => [number, number] };
}): { width: number; height: number } {
  const size = model.internalModel?.getSize?.();
  if (size && size[0] > 0 && size[1] > 0) {
    return { width: size[0], height: size[1] };
  }
  return { width: DEFAULT_CANVAS.width, height: DEFAULT_CANVAS.height };
}

function resolveLayoutPreset(
  modelId: PatientLive2DModel | undefined,
  canvasH: number
): (typeof BUST_LAYOUT)[PatientLive2DModel] {
  if (modelId && BUST_LAYOUT[modelId]) {
    return BUST_LAYOUT[modelId];
  }
  if (canvasH > 700) {
    return BUST_LAYOUT.haru;
  }
  return BUST_LAYOUT.natori;
}

export interface LayoutLive2dOptions {
  preview?: boolean;
  participantRole?: Live2DParticipantRole;
  /** Orientación en consulta bilateral */
  faceToward?: "left" | "right";
  /** Vista única con dos personajes (escala reducida) */
  consultation?: boolean;
  /** Centro horizontal 0–1 en canvas compartido */
  centerX?: number;
}

/** Encuadre torso-arriba, centrado en el viewport. */
export function layoutLive2dParticipant(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  viewportWidth: number,
  viewportHeight: number,
  modelId?: PatientLive2DModel,
  options?: LayoutLive2dOptions
): void {
  const { width: canvasW, height: canvasH } = getNatoriCanvasSize(model);
  const preset = resolveLayoutPreset(modelId, canvasH);

  const regionH = canvasH * preset.heightRatio;
  const regionW = canvasW * preset.widthRatio;
  const defaultMargin = options?.preview ? 0.9 : 0.94;
  let margin = options?.preview
    ? (preset.marginPreview ?? defaultMargin)
    : (preset.marginPlay ?? defaultMargin);

  let scaleBoost = preset.scaleBoost ?? 1;
  let positionY = preset.positionY;

  if (options?.participantRole === "psychologist" && !options.preview) {
    margin *= 0.96;
    scaleBoost *= 0.98;
    positionY = Math.min(positionY + 0.02, 0.58);
  }

  if (options?.consultation) {
    margin *= 1.02;
    positionY = 0.5;
  }

  const scale =
    Math.min(
      (viewportHeight * margin) / regionH,
      (viewportWidth * margin) / regionW
    ) * scaleBoost;

  const centerX = options?.centerX ?? 0.5;

  model.anchor.set(0.5, preset.anchorY);
  const scaleX =
    options?.faceToward === "right" ? -scale : options?.faceToward === "left" ? scale : scale;
  model.scale.set(scaleX, scale);
  model.position.set(viewportWidth * centerX, viewportHeight * positionY);
}

export type ConsultationSlot = "psychologist" | "patient";

/** Encuadre bilateral: escala y posición por rol y modelo (equilibra Natori vs Haru). */
const CONSULTATION_SLOT: Record<
  ConsultationSlot,
  Record<
    PatientLive2DModel,
    {
      centerX: number;
      scaleBoost: number;
      positionY: number;
      anchorY: number;
      heightRatio: number;
      widthRatio: number;
      margin: number;
    }
  >
> = {
  psychologist: {
    natori: {
      centerX: 0.26,
      scaleBoost: 1.12,
      positionY: 0.56,
      anchorY: 0.3,
      heightRatio: 0.5,
      widthRatio: 0.58,
      margin: 0.84,
    },
    haru: {
      centerX: 0.26,
      scaleBoost: 0.78,
      positionY: 0.5,
      anchorY: 0.17,
      heightRatio: 0.36,
      widthRatio: 0.5,
      margin: 0.86,
    },
  },
  patient: {
    natori: {
      centerX: 0.74,
      scaleBoost: 1.12,
      positionY: 0.56,
      anchorY: 0.3,
      heightRatio: 0.5,
      widthRatio: 0.58,
      margin: 0.84,
    },
    haru: {
      centerX: 0.74,
      scaleBoost: 0.78,
      positionY: 0.5,
      anchorY: 0.17,
      heightRatio: 0.36,
      widthRatio: 0.5,
      margin: 0.86,
    },
  },
};

export function layoutLive2dConsultationSlot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  viewportWidth: number,
  viewportHeight: number,
  modelId: PatientLive2DModel,
  slot: ConsultationSlot,
  faceToward: "left" | "right"
): void {
  const { width: canvasW, height: canvasH } = getNatoriCanvasSize(model);
  const slotPreset = CONSULTATION_SLOT[slot][modelId];

  const regionH = canvasH * slotPreset.heightRatio;
  const regionW = canvasW * slotPreset.widthRatio;

  const scale =
    Math.min(
      (viewportHeight * slotPreset.margin) / regionH,
      (viewportWidth * slotPreset.margin) / regionW
    ) * slotPreset.scaleBoost;

  model.anchor.set(0.5, slotPreset.anchorY);
  const scaleX = faceToward === "right" ? -scale : scale;
  model.scale.set(scaleX, scale);
  model.position.set(
    viewportWidth * slotPreset.centerX,
    viewportHeight * slotPreset.positionY
  );
}

/** @deprecated Alias — usar layoutLive2dParticipant */
export const layoutLive2dPatient = layoutLive2dParticipant;
