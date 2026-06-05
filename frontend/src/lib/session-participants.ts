import { categoryToPsychologistState } from "@/lib/live2d-expressions";
import { getComplementaryLive2DModel } from "@/lib/live2d-models";
import type {
  DialogueOption,
  PatientLive2DModel,
  PsychologistVisualState,
  Scene,
  SessionParticipant,
  User,
} from "@/types";

export const PSYCHOLOGIST_STATE_LABELS: Record<PsychologistVisualState, string> = {
  escucha_activa: "Escucha activa",
  empatia: "Empatía",
  reflexion: "Reflexión",
  validacion: "Validación",
  intervencion: "Intervención",
  observacion: "Observación",
};

export function buildPsychologistParticipant(
  patientModel: PatientLive2DModel,
  user: User | null,
  lastOptionCategory?: DialogueOption["category"]
): SessionParticipant {
  const estadoVisual = categoryToPsychologistState(lastOptionCategory);
  return {
    id: "psicologo-01",
    nombre: user?.name ?? "Estudiante",
    rol: "Psicóloga en formación",
    participantRole: "psychologist",
    modelId: getComplementaryLive2DModel(patientModel),
    estadoVisual,
  };
}

export function buildPatientParticipant(
  patientModel: PatientLive2DModel,
  scene: Scene | undefined,
  expressionLabel: string
): SessionParticipant {
  return {
    id: "paciente-01",
    nombre: scene?.speaker ?? "Paciente",
    rol: "Paciente virtual",
    participantRole: "patient",
    modelId: patientModel,
    estadoVisual: expressionLabel,
  };
}
