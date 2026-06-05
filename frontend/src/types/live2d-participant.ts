import type { PatientLive2DModel } from "@/types";

export type Live2DParticipantRole = "patient" | "psychologist";

/** Estados pedagógicos del psicólogo (no emociones clínicas). */
export type PsychologistVisualState =
  | "escucha_activa"
  | "empatia"
  | "reflexion"
  | "validacion"
  | "intervencion"
  | "observacion";

export interface SessionParticipant {
  id: string;
  nombre: string;
  rol: string;
  /** Rol en la infraestructura Live2D compartida */
  participantRole: Live2DParticipantRole;
  modelId: PatientLive2DModel;
  estadoVisual: PsychologistVisualState | string;
}
