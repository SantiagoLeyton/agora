import type {
  BuilderQuestionResponse,
  BuilderSceneResponse,
  CaseBuilderResponse,
  CaseResponse,
} from "@/types/clinical-case";
import type { DialogueOption, Scene, SimulationCase } from "@/types";
import type {
  AttemptSummaryResponse,
  SimulationResponse,
  SimulationStateResponse,
} from "@/types/simulation";
import type { PatientLive2DModel, SimulationSession } from "@/types";

const optionCategories: NonNullable<DialogueOption["category"]>[] = [
  "explore",
  "assess",
  "intervene",
  "close",
];

function mapDifficulty(value: string): SimulationCase["difficulty"] {
  const normalized = value.trim().toUpperCase();
  if (normalized.includes("AVANZ")) return "advanced";
  if (normalized.includes("INTER")) return "intermediate";
  return "basic";
}

function nonEmpty(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

export function mapCaseToSimulationCase(response: CaseResponse): SimulationCase {
  return {
    id: String(response.id),
    title: response.titulo,
    description: nonEmpty(response.descripcion, "Sin descripcion registrada."),
    category: "Simulacion clinica",
    difficulty: mapDifficulty(response.nivelDificultad),
    durationMinutes: response.duracionEstimada,
    status: "not_started",
    progress: 0,
    tags: [response.nivelDificultad, response.activo ? "Activo" : "Inactivo"],
    learningObjectives: [nonEmpty(response.objetivo, "Objetivo pendiente de documentar.")],
    patientModel: "haru",
  };
}

function answeredQuestionIds(summary?: AttemptSummaryResponse): Set<number> {
  return new Set(summary?.respuestas.map((answer) => answer.preguntaId) ?? []);
}

function firstPendingQuestion(
  scene: BuilderSceneResponse,
  summary?: AttemptSummaryResponse
): BuilderQuestionResponse | undefined {
  const answered = answeredQuestionIds(summary);
  return scene.preguntas
    .filter(({ pregunta }) => pregunta.activo)
    .find(({ pregunta }) => !answered.has(pregunta.id));
}

function nextSceneId(
  scenes: BuilderSceneResponse[],
  index: number,
  fallback: string
): string {
  return String(scenes[index + 1]?.escena.id ?? fallback);
}

export function mapBuilderToScenes(
  builder: CaseBuilderResponse,
  summary?: AttemptSummaryResponse
): Scene[] {
  return builder.escenas
    .filter(({ escena }) => escena.activo)
    .map((scene, index, scenes) => {
      const pendingQuestion = firstPendingQuestion(scene, summary);
      const question = pendingQuestion ?? scene.preguntas.find(({ pregunta }) => pregunta.activo);
      const options = (question?.opciones ?? [])
        .filter((option) => option.activo)
        .map<DialogueOption>((option, optionIndex) => ({
          id: String(option.id),
          questionId: String(option.preguntaId),
          label: option.texto,
          description: option.descripcion ?? undefined,
          nextSceneId: nextSceneId(scenes, index, String(scene.escena.id)),
          category: optionCategories[optionIndex % optionCategories.length],
        }));

      return {
        id: String(scene.escena.id),
        title: scene.escena.titulo,
        setting: nonEmpty(scene.escena.descripcion, "Escena clinica"),
        narrative: scene.escena.contenido,
        speaker: "Paciente",
        speakerRole: "patient",
        options,
        supportTools: [
          ...builder.herramientas.filter((tool) => tool.activo).map((tool) => tool.nombre),
          ...builder.entidades.filter((entity) => entity.activo).map((entity) => entity.nombre),
        ],
      };
    });
}

function findSceneIdForQuestion(
  builder: CaseBuilderResponse,
  questionId: number
): string {
  const scene = builder.escenas.find((item) =>
    item.preguntas.some(({ pregunta }) => pregunta.id === questionId)
  );
  return String(scene?.escena.id ?? "");
}

export function mapSimulationToSession(
  simulation: SimulationResponse,
  builder: CaseBuilderResponse,
  patientModel: PatientLive2DModel,
  summary?: AttemptSummaryResponse
): SimulationSession {
  const startedAt = simulation.intento.fechaInicio;
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  );

  return {
    attemptId: simulation.intento.id,
    status: simulation.intento.estado,
    states: simulation.estados,
    caseId: String(simulation.intento.casoId),
    currentSceneId: simulation.escenaActual ? String(simulation.escenaActual.id) : "",
    patientModel,
    decisions:
      summary?.respuestas.map((answer) => ({
        sceneId: findSceneIdForQuestion(builder, answer.preguntaId),
        optionId: String(answer.opcionId),
        timestamp: answer.fechaRespuesta,
      })) ?? [],
    startedAt,
    elapsedSeconds,
  };
}

function findState(states: SimulationStateResponse[], name: string): number | null {
  const state = states.find((item) => item.nombre.toUpperCase() === name);
  return state?.valorActual ?? null;
}

export function mapStatesToEmotionalProfile(
  states: SimulationStateResponse[] | undefined
) {
  if (!states?.length) return null;

  const ansiedad = findState(states, "ANSIEDAD");
  const confianza = findState(states, "CONFIANZA");
  const cooperacion = findState(states, "COOPERACION");
  const estres = findState(states, "ESTRES");
  const resistencia = findState(states, "RESISTENCIA");

  return {
    anxiety: ansiedad ?? estres ?? 50,
    stability: Math.max(0, 100 - (estres ?? ansiedad ?? 50)),
    therapeuticAlliance: confianza ?? cooperacion ?? 50,
    riskLevel: resistencia ?? 0,
    emotionalTension: estres ?? resistencia ?? ansiedad ?? 50,
  };
}
