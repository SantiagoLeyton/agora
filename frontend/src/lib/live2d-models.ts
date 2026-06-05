import type { Live2DParticipantRole, PatientLive2DModel } from "@/types";

export interface Live2DModelConfig {
  id: PatientLive2DModel;
  label: string;
  modelUrl: string;
  /** Motion groups available in model3.json */
  idleMotion: string;
  tapMotion: string;
  /** Roles de sesión que pueden usar este asset */
  participantRoles: Live2DParticipantRole[];
}

/** Registro único de assets Live2D (paciente y psicólogo comparten proveedor). */
export const LIVE2D_MODELS: Record<PatientLive2DModel, Live2DModelConfig> = {
  natori: {
    id: "natori",
    label: "Modelo Natori",
    modelUrl: "/live2d/patient/Natori.model3.json",
    idleMotion: "Idle",
    tapMotion: "TapBody",
    participantRoles: ["patient", "psychologist"],
  },
  haru: {
    id: "haru",
    label: "Modelo Haru",
    modelUrl: "/live2d/haru/Haru.model3.json",
    idleMotion: "Idle",
    tapMotion: "TapBody",
    participantRoles: ["patient", "psychologist"],
  },
};

export function getLive2DModelConfig(modelId?: PatientLive2DModel): Live2DModelConfig {
  return LIVE2D_MODELS[modelId ?? "natori"];
}

/** Modelo complementario para distinguir psicólogo y paciente en sesión. */
export function getComplementaryLive2DModel(
  patientModel: PatientLive2DModel
): PatientLive2DModel {
  return patientModel === "haru" ? "natori" : "haru";
}

export function getDefaultPatientModel(caseId: string): PatientLive2DModel {
  if (
    caseId === "case-anxiety-001" ||
    caseId === "case-crisis-003" ||
    caseId.startsWith("case-custom-f-")
  ) {
    return "haru";
  }
  return "natori";
}
