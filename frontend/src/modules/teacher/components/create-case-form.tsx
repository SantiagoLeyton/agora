"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading, Surface } from "@/components/design-system";
import { LIVE2D_MODELS } from "@/lib/live2d-models";
import {
  useCaseBuilder,
  useClinicalEntities,
  useClinicalTools,
  useCreateCaseBundle,
  useUpdateCaseBundle,
} from "@/hooks/use-data";
import type {
  CreateCaseBundleRequest,
  UpdateCaseBundleRequest,
} from "@/services/case-service";
import type { CaseBuilderResponse } from "@/types/clinical-case";
import type { CaseDifficulty, PatientLive2DModel } from "@/types";

const fieldClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const MIN_SCENES = 1;
const MIN_QUESTIONS = 1;
const MIN_OPTIONS = 2;
const MIN_RDA = 1;

let nextId = 0;
function uid(): string {
  nextId += 1;
  return `item-${nextId}`;
}

interface FormLearningOutcome {
  id: string;
  descripcion: string;
}

interface FormOption {
  id: string;
  backendId?: number;
  texto: string;
  descripcion: string;
  porcentajeCredito: string;
}

interface FormQuestion {
  id: string;
  backendId?: number;
  enunciado: string;
  pesoPuntos: string;
  options: FormOption[];
}

interface FormScene {
  id: string;
  backendId?: number;
  titulo: string;
  setting: string;
  narrative: string;
  questions: FormQuestion[];
}

interface CaseBuilderFormProps {
  mode?: "create" | "edit";
  caseId?: string;
}

function defaultOptionCredit(optionIndex: number, totalOptions: number): string {
  if (totalOptions <= 1) return "100";
  const credit = Math.round(100 - (optionIndex * 100) / (totalOptions - 1));
  return String(Math.max(0, credit));
}

function createDefaultOutcome(text = ""): FormLearningOutcome {
  return { id: uid(), descripcion: text };
}

function createDefaultOption(
  texto = "",
  descripcion = "",
  porcentajeCredito = "100",
  backendId?: number
): FormOption {
  return { id: uid(), backendId, texto, descripcion, porcentajeCredito };
}

function createDefaultQuestion(): FormQuestion {
  const options = [
    createDefaultOption("Explorar emociones", "Exploracion inicial del motivo de consulta.", "100"),
    createDefaultOption("Evaluar clínicamente", "Evaluacion clinica inicial.", "50"),
  ];
  return {
    id: uid(),
    enunciado: "",
    pesoPuntos: "1",
    options,
  };
}

function createDefaultScene(index: number): FormScene {
  return {
    id: uid(),
    titulo: index === 0 ? "Primera escena" : `Escena ${index + 1}`,
    setting: "Consultorio universitario",
    narrative: "",
    questions: [createDefaultQuestion()],
  };
}

function mapDifficultyFromBackend(value: string): CaseDifficulty {
  const normalized = value.trim().toUpperCase();
  if (normalized.includes("AVANZ")) return "advanced";
  if (normalized.includes("INTER")) return "intermediate";
  return "basic";
}

function mapBuilderToForm(builder: CaseBuilderResponse) {
  return {
    title: builder.caso.titulo,
    description: builder.caso.descripcion ?? "",
    category: builder.caso.descripcion ?? "Simulación clínica",
    difficulty: mapDifficultyFromBackend(builder.caso.nivelDificultad),
    durationMinutes: builder.caso.duracionEstimada,
    learningObjective: builder.caso.objetivo ?? "",
    learningOutcomes:
      builder.resultadosAprendizaje.length > 0
        ? builder.resultadosAprendizaje.map((item) =>
            createDefaultOutcome(item.descripcion)
          )
        : [createDefaultOutcome()],
    toolIds: builder.herramientas.map((tool) => tool.id),
    entityIds: builder.entidades.map((entity) => entity.id),
    scenes: builder.escenas.map((sceneBundle) => ({
      id: uid(),
      backendId: sceneBundle.escena.id,
      titulo: sceneBundle.escena.titulo,
      setting: sceneBundle.escena.descripcion ?? "Consultorio universitario",
      narrative: sceneBundle.escena.contenido,
      questions: sceneBundle.preguntas.map((questionBundle) => ({
        id: uid(),
        backendId: questionBundle.pregunta.id,
        enunciado: questionBundle.pregunta.enunciado,
        pesoPuntos: String(questionBundle.pregunta.pesoPuntos ?? 1),
        options: questionBundle.opciones.map((option, optionIndex) =>
          createDefaultOption(
            option.texto,
            option.descripcion ?? "",
            String(option.porcentajeCredito ?? defaultOptionCredit(optionIndex, questionBundle.opciones.length)),
            option.id
          )
        ),
      })),
    })) as FormScene[],
  };
}

function validateForm(
  title: string,
  learningOutcomes: FormLearningOutcome[],
  scenes: FormScene[]
): string | null {
  if (!title.trim()) {
    return "El título del caso es obligatorio.";
  }
  if (learningOutcomes.length < MIN_RDA) {
    return "El caso debe tener al menos un resultado de aprendizaje.";
  }
  const normalizedOutcomes = learningOutcomes.map((item) => item.descripcion.trim().toLowerCase());
  if (normalizedOutcomes.some((item) => !item)) {
    return "Los resultados de aprendizaje no pueden estar vacíos.";
  }
  if (new Set(normalizedOutcomes).size !== normalizedOutcomes.length) {
    return "Los resultados de aprendizaje no pueden duplicarse.";
  }
  if (scenes.length < MIN_SCENES) {
    return "El caso debe tener al menos una escena.";
  }

  for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex += 1) {
    const scene = scenes[sceneIndex];
    if (!scene.titulo.trim()) {
      return `La escena ${sceneIndex + 1} necesita un título.`;
    }
    if (!scene.narrative.trim()) {
      return `La escena ${sceneIndex + 1} necesita el relato del paciente.`;
    }
    if (scene.questions.length < MIN_QUESTIONS) {
      return `La escena ${sceneIndex + 1} debe tener al menos una pregunta.`;
    }

    for (let questionIndex = 0; questionIndex < scene.questions.length; questionIndex += 1) {
      const question = scene.questions[questionIndex];
      if (!question.enunciado.trim()) {
        return `La pregunta ${questionIndex + 1} de la escena ${sceneIndex + 1} necesita un enunciado.`;
      }
      if (question.options.length < MIN_OPTIONS) {
        return `La pregunta ${questionIndex + 1} de la escena ${sceneIndex + 1} debe tener al menos 2 opciones.`;
      }

      for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
        if (!question.options[optionIndex].texto.trim()) {
          return `La opción ${optionIndex + 1} de la pregunta ${questionIndex + 1} (escena ${sceneIndex + 1}) necesita texto.`;
        }
      }
    }
  }

  return null;
}

function backendDifficulty(difficulty: CaseDifficulty): string {
  const map: Record<CaseDifficulty, string> = {
    basic: "BASICO",
    intermediate: "INTERMEDIO",
    advanced: "AVANZADO",
  };
  return map[difficulty];
}

function buildBundleRequest(
  title: string,
  description: string,
  category: string,
  difficulty: CaseDifficulty,
  durationMinutes: number,
  learningObjective: string,
  learningOutcomes: FormLearningOutcome[],
  scenes: FormScene[],
  toolIds: number[],
  entityIds: number[]
): CreateCaseBundleRequest {
  return {
    case: {
      titulo: title.trim(),
      descripcion: description.trim() || category.trim(),
      objetivo: learningObjective.trim() || null,
      nivelDificultad: backendDifficulty(difficulty),
      duracionEstimada: durationMinutes,
    },
    learningOutcomes: learningOutcomes.map((item, index) => ({
      orden: index + 1,
      descripcion: item.descripcion.trim(),
    })),
    toolIds,
    entityIds,
    scenes: scenes.map((scene, sceneIndex) => ({
      scene: {
        orden: sceneIndex + 1,
        titulo: scene.titulo.trim(),
        descripcion: scene.setting.trim() || null,
        contenido: scene.narrative.trim(),
        activo: true,
      },
      questions: scene.questions.map((question) => ({
        question: {
          enunciado: question.enunciado.trim(),
          obligatoria: true,
          activo: true,
          pesoPuntos: Number(question.pesoPuntos) || null,
        },
        options: question.options.map((option, optionIndex) => ({
          texto: option.texto.trim(),
          descripcion: option.descripcion.trim() || null,
          orden: optionIndex + 1,
          activo: true,
          porcentajeCredito: Number(option.porcentajeCredito),
        })),
      })),
    })),
  };
}

function buildUpdateBundleRequest(
  title: string,
  description: string,
  category: string,
  difficulty: CaseDifficulty,
  durationMinutes: number,
  learningObjective: string,
  learningOutcomes: FormLearningOutcome[],
  scenes: FormScene[],
  toolIds: number[],
  entityIds: number[]
): UpdateCaseBundleRequest {
  const createRequest = buildBundleRequest(
    title,
    description,
    category,
    difficulty,
    durationMinutes,
    learningObjective,
    learningOutcomes,
    scenes,
    toolIds,
    entityIds
  );

  return {
    case: createRequest.case,
    learningOutcomes: createRequest.learningOutcomes,
    toolIds,
    entityIds,
    scenes: scenes.map((scene, sceneIndex) => ({
      sceneId: scene.backendId,
      scene: {
        orden: sceneIndex + 1,
        titulo: scene.titulo.trim(),
        descripcion: scene.setting.trim() || null,
        contenido: scene.narrative.trim(),
        activo: true,
      },
      questions: scene.questions.map((question) => ({
        questionId: question.backendId,
        question: {
          enunciado: question.enunciado.trim(),
          obligatoria: true,
          activo: true,
          pesoPuntos: Number(question.pesoPuntos) || null,
        },
        options: question.options.map((option, optionIndex) => ({
          optionId: option.backendId,
          option: {
            texto: option.texto.trim(),
            descripcion: option.descripcion.trim() || null,
            orden: optionIndex + 1,
            activo: true,
            porcentajeCredito: Number(option.porcentajeCredito),
          },
        })),
      })),
    })),
  };
}

export function CaseBuilderForm({ mode = "create", caseId }: CaseBuilderFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit" && caseId != null;
  const numericCaseId = Number(caseId);
  const createCaseBundle = useCreateCaseBundle();
  const updateCaseBundle = useUpdateCaseBundle(numericCaseId);
  const { data: builder, isLoading: builderLoading } = useCaseBuilder(caseId ?? "");
  const { data: tools = [] } = useClinicalTools();
  const { data: entities = [] } = useClinicalEntities();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Simulación clínica");
  const [difficulty, setDifficulty] = useState<CaseDifficulty>("intermediate");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [patientModel, setPatientModel] = useState<PatientLive2DModel>("haru");
  const [learningObjective, setLearningObjective] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState<FormLearningOutcome[]>([
    createDefaultOutcome(),
  ]);
  const [toolIds, setToolIds] = useState<number[]>([]);
  const [entityIds, setEntityIds] = useState<number[]>([]);
  const [scenes, setScenes] = useState<FormScene[]>([createDefaultScene(0)]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit || !builder) return;
    const mapped = mapBuilderToForm(builder);
    setTitle(mapped.title);
    setDescription(mapped.description);
    setCategory(mapped.category);
    setDifficulty(mapped.difficulty);
    setDurationMinutes(mapped.durationMinutes);
    setLearningObjective(mapped.learningObjective);
    setLearningOutcomes(mapped.learningOutcomes);
    setToolIds(mapped.toolIds);
    setEntityIds(mapped.entityIds);
    setScenes(mapped.scenes.length > 0 ? mapped.scenes : [createDefaultScene(0)]);
    setHydrated(true);
  }, [builder, isEdit]);

  const toggleSelection = (current: number[], id: number) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id];

  const updateScene = (sceneId: string, patch: Partial<FormScene>) => {
    setScenes((current) =>
      current.map((scene) => (scene.id === sceneId ? { ...scene, ...patch } : scene))
    );
  };

  const addScene = () => {
    setScenes((current) => [...current, createDefaultScene(current.length)]);
  };

  const removeScene = (sceneId: string) => {
    if (scenes.length <= MIN_SCENES) return;
    setScenes((current) => current.filter((scene) => scene.id !== sceneId));
  };

  const addQuestion = (sceneId: string) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId
          ? { ...scene, questions: [...scene.questions, createDefaultQuestion()] }
          : scene
      )
    );
  };

  const removeQuestion = (sceneId: string, questionId: string) => {
    setScenes((current) =>
      current.map((scene) => {
        if (scene.id !== sceneId || scene.questions.length <= MIN_QUESTIONS) return scene;
        return {
          ...scene,
          questions: scene.questions.filter((question) => question.id !== questionId),
        };
      })
    );
  };

  const updateQuestion = (
    sceneId: string,
    questionId: string,
    patch: Partial<FormQuestion>
  ) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              questions: scene.questions.map((question) =>
                question.id === questionId ? { ...question, ...patch } : question
              ),
            }
          : scene
      )
    );
  };

  const addOption = (sceneId: string, questionId: string) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              questions: scene.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      options: [
                        ...question.options,
                        createDefaultOption(
                          "",
                          "",
                          defaultOptionCredit(
                            question.options.length,
                            question.options.length + 1
                          )
                        ),
                      ],
                    }
                  : question
              ),
            }
          : scene
      )
    );
  };

  const removeOption = (sceneId: string, questionId: string, optionId: string) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              questions: scene.questions.map((question) => {
                if (question.id !== questionId || question.options.length <= MIN_OPTIONS) {
                  return question;
                }
                return {
                  ...question,
                  options: question.options.filter((option) => option.id !== optionId),
                };
              }),
            }
          : scene
      )
    );
  };

  const updateOption = (
    sceneId: string,
    questionId: string,
    optionId: string,
    patch: Partial<FormOption>
  ) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              questions: scene.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      options: question.options.map((option) =>
                        option.id === optionId ? { ...option, ...patch } : option
                      ),
                    }
                  : question
              ),
            }
          : scene
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm(title, learningOutcomes, scenes);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateCaseBundle.mutateAsync(
          buildUpdateBundleRequest(
            title,
            description,
            category,
            difficulty,
            durationMinutes,
            learningObjective,
            learningOutcomes,
            scenes,
            toolIds,
            entityIds
          )
        );
        router.push("/teacher/cases");
      } else {
        const bundle = await createCaseBundle.mutateAsync(
          buildBundleRequest(
            title,
            description,
            category,
            difficulty,
            durationMinutes,
            learningObjective,
            learningOutcomes,
            scenes,
            toolIds,
            entityIds
          )
        );
        router.push(`/simulator/${bundle.caso.id}`);
      }
    } catch {
      setError("No se pudo guardar el caso. Intenta de nuevo.");
      setSaving(false);
    }
  };

  if (isEdit && (builderLoading || !hydrated)) {
    return <PageLoading />;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <Surface className="space-y-5 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Datos del caso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            El caso se guarda en el repositorio clínico y queda disponible en el simulador.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Ansiedad ante evaluaciones orales"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            className={`${fieldClass} min-h-[88px] py-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Resumen clínico del caso para el estudiante"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificultad</Label>
            <select
              id="difficulty"
              className={fieldClass}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as CaseDifficulty)}
            >
              <option value="basic">Básica</option>
              <option value="intermediate">Intermedia</option>
              <option value="advanced">Avanzada</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (min)</Label>
            <Input
              id="duration"
              type="number"
              min={15}
              max={120}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 45)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientModel">Avatar del paciente</Label>
            <select
              id="patientModel"
              className={fieldClass}
              value={patientModel}
              onChange={(e) => setPatientModel(e.target.value as PatientLive2DModel)}
            >
              {(Object.keys(LIVE2D_MODELS) as PatientLive2DModel[]).map((id) => (
                <option key={id} value={id}>
                  {LIVE2D_MODELS[id].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo complementario (opcional)</Label>
          <Input
            id="objective"
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
            placeholder="Nota pedagógica breve; los RDA son el descriptor principal"
          />
        </div>
      </Surface>

      <Surface className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Resultados de aprendizaje</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Define qué debe lograr el estudiante al completar el caso.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setLearningOutcomes((current) => [...current, createDefaultOutcome()])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar resultado
          </Button>
        </div>

        {learningOutcomes.map((outcome, index) => (
          <div key={outcome.id} className="flex gap-2">
            <Input
              value={outcome.descripcion}
              onChange={(e) =>
                setLearningOutcomes((current) =>
                  current.map((item) =>
                    item.id === outcome.id ? { ...item, descripcion: e.target.value } : item
                  )
                )
              }
              placeholder={`Resultado ${index + 1}`}
            />
            {learningOutcomes.length > MIN_RDA && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setLearningOutcomes((current) =>
                    current.filter((item) => item.id !== outcome.id)
                  )
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </Surface>

      <Surface className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">Herramientas y entidades</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Herramientas clínicas</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border/60 p-3">
              {tools.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay herramientas disponibles.</p>
              ) : (
                tools.map((tool) => (
                  <label key={tool.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={toolIds.includes(tool.id)}
                      onChange={() => setToolIds((current) => toggleSelection(current, tool.id))}
                    />
                    {tool.nombre}
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Entidades institucionales</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border/60 p-3">
              {entities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay entidades disponibles.</p>
              ) : (
                entities.map((entity) => (
                  <label key={entity.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={entityIds.includes(entity.id)}
                      onChange={() => setEntityIds((current) => toggleSelection(current, entity.id))}
                    />
                    {entity.nombre}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </Surface>

      {scenes.map((scene, sceneIndex) => (
        <Surface key={scene.id} className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Escena {sceneIndex + 1}</h2>
            <div className="flex gap-2">
              {scenes.length > MIN_SCENES && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeScene(scene.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar escena
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`scene-title-${scene.id}`}>Título de la escena *</Label>
            <Input
              id={`scene-title-${scene.id}`}
              value={scene.titulo}
              onChange={(e) => updateScene(scene.id, { titulo: e.target.value })}
              placeholder="Ej. Primera consulta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`scene-setting-${scene.id}`}>Escenario</Label>
            <Input
              id={`scene-setting-${scene.id}`}
              value={scene.setting}
              onChange={(e) => updateScene(scene.id, { setting: e.target.value })}
              placeholder="Ej. Consultorio universitario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`scene-narrative-${scene.id}`}>Relato del paciente *</Label>
            <textarea
              id={`scene-narrative-${scene.id}`}
              className={`${fieldClass} min-h-[120px] py-2`}
              value={scene.narrative}
              onChange={(e) => updateScene(scene.id, { narrative: e.target.value })}
              placeholder="Texto que verá el estudiante en esta escena"
            />
          </div>

          <div className="space-y-4 border-t border-border/60 pt-4">
            {scene.questions.map((question, questionIndex) => (
              <div
                key={question.id}
                className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Pregunta {questionIndex + 1}</h3>
                  {scene.questions.length > MIN_QUESTIONS && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(scene.id, question.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar pregunta
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>Enunciado *</Label>
                    <Input
                      id={`question-${question.id}`}
                      value={question.enunciado}
                      onChange={(e) =>
                        updateQuestion(scene.id, question.id, { enunciado: e.target.value })
                      }
                      placeholder="Ej. ¿Cómo abordarías la situación emocional del paciente?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`question-weight-${question.id}`}>Peso (pts)</Label>
                    <Input
                      id={`question-weight-${question.id}`}
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={question.pesoPuntos}
                      onChange={(e) =>
                        updateQuestion(scene.id, question.id, { pesoPuntos: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Opciones</p>
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="grid gap-3 rounded-lg border border-border/40 bg-background p-3 sm:grid-cols-[1fr_1fr_100px_auto]"
                    >
                      <div className="space-y-1">
                        <Label htmlFor={`option-text-${option.id}`} className="text-xs">
                          Opción {optionIndex + 1} *
                        </Label>
                        <Input
                          id={`option-text-${option.id}`}
                          value={option.texto}
                          onChange={(e) =>
                            updateOption(scene.id, question.id, option.id, {
                              texto: e.target.value,
                            })
                          }
                          placeholder="Texto de la opción"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`option-desc-${option.id}`} className="text-xs">
                          Descripción
                        </Label>
                        <Input
                          id={`option-desc-${option.id}`}
                          value={option.descripcion}
                          onChange={(e) =>
                            updateOption(scene.id, question.id, option.id, {
                              descripcion: e.target.value,
                            })
                          }
                          placeholder="Breve descripción clínica"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`option-credit-${option.id}`} className="text-xs">
                          Crédito %
                        </Label>
                        <Input
                          id={`option-credit-${option.id}`}
                          type="number"
                          min={0}
                          max={100}
                          value={option.porcentajeCredito}
                          onChange={(e) =>
                            updateOption(scene.id, question.id, option.id, {
                              porcentajeCredito: e.target.value,
                            })
                          }
                        />
                      </div>
                      {question.options.length > MIN_OPTIONS && (
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(scene.id, question.id, option.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(scene.id, question.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar opción
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuestion(scene.id)}
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar pregunta
            </Button>
          </div>
        </Surface>
      ))}

      <Button type="button" variant="outline" onClick={addScene}>
        <Plus className="h-4 w-4" />
        Agregar escena
      </Button>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="brand" disabled={saving}>
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear y publicar caso"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function CreateCaseForm() {
  return <CaseBuilderForm mode="create" />;
}
