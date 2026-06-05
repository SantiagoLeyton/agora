import type {
  CaseDifficulty,
  DialogueOption,
  PatientLive2DModel,
  Scene,
  SimulationCase,
} from "@/types";
import type { TeacherCaseBundle } from "@/store/cases-catalog";

export interface CreateCaseFormInput {
  title: string;
  description: string;
  category: string;
  difficulty: CaseDifficulty;
  durationMinutes: number;
  patientModel: PatientLive2DModel;
  patientName: string;
  setting: string;
  narrative: string;
  learningObjective: string;
  optionExploreLabel: string;
  optionAssessLabel: string;
}

export function buildTeacherCaseBundle(input: CreateCaseFormInput): TeacherCaseBundle {
  const caseId = `case-custom-${Date.now()}`;
  const sceneId = `${caseId}-scene-1`;
  const endSceneId = `${caseId}-end`;

  const options: DialogueOption[] = [
    {
      id: `${caseId}-opt-explore`,
      label: input.optionExploreLabel.trim() || "Explorar emociones",
      description: "Profundizar en la experiencia del paciente",
      nextSceneId: endSceneId,
      category: "explore",
    },
    {
      id: `${caseId}-opt-assess`,
      label: input.optionAssessLabel.trim() || "Evaluar clínicamente",
      description: "Indagar síntomas y contexto",
      nextSceneId: endSceneId,
      category: "assess",
    },
  ];

  const scenes: Scene[] = [
    {
      id: sceneId,
      title: "Primera consulta",
      setting: input.setting.trim() || "Consultorio",
      narrative: input.narrative.trim(),
      speaker: input.patientName.trim() || "Paciente",
      speakerRole: "patient",
      supportTools: ["Guía de entrevista clínica"],
      options,
    },
    {
      id: endSceneId,
      title: "Sesión completada",
      setting: "Resumen clínico",
      narrative:
        "Has completado esta simulación creada por tu docente. Revisa tu enfoque y la retroalimentación en el módulo de evaluación.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
  ];

  const caseItem: SimulationCase = {
    id: caseId,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim() || "Simulación clínica",
    difficulty: input.difficulty,
    durationMinutes: input.durationMinutes,
    status: "not_started",
    progress: 0,
    tags: ["personalizado", "docente"],
    learningObjectives: [
      input.learningObjective.trim() || "Aplicar habilidades de entrevista clínica",
    ],
    patientModel: input.patientModel,
    isCustom: true,
  };

  return { case: caseItem, scenes };
}
