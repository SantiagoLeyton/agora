"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Surface } from "@/components/design-system";
import { LIVE2D_MODELS } from "@/lib/live2d-models";
import { useCreateCaseBundle } from "@/hooks/use-data";
import type { CreateCaseBundleRequest } from "@/services/case-service";
import type { CaseDifficulty, PatientLive2DModel } from "@/types";

const fieldClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const MIN_SCENES = 1;
const MIN_QUESTIONS = 1;
const MIN_OPTIONS = 2;

let nextId = 0;
function uid(): string {
  nextId += 1;
  return `item-${nextId}`;
}

interface FormOption {
  id: string;
  texto: string;
  descripcion: string;
}

interface FormQuestion {
  id: string;
  enunciado: string;
  options: FormOption[];
}

interface FormScene {
  id: string;
  titulo: string;
  setting: string;
  narrative: string;
  questions: FormQuestion[];
}

function createDefaultOption(texto = "", descripcion = ""): FormOption {
  return { id: uid(), texto, descripcion };
}

function createDefaultQuestion(): FormQuestion {
  return {
    id: uid(),
    enunciado: "",
    options: [
      createDefaultOption("Explorar emociones", "Exploracion inicial del motivo de consulta."),
      createDefaultOption("Evaluar clínicamente", "Evaluacion clinica inicial."),
    ],
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

function validateForm(
  title: string,
  scenes: FormScene[]
): string | null {
  if (!title.trim()) {
    return "El título del caso es obligatorio.";
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

function buildBundleRequest(
  title: string,
  description: string,
  category: string,
  difficulty: CaseDifficulty,
  durationMinutes: number,
  learningObjective: string,
  scenes: FormScene[]
): CreateCaseBundleRequest {
  const backendDifficulty: Record<CaseDifficulty, string> = {
    basic: "BASICO",
    intermediate: "INTERMEDIO",
    advanced: "AVANZADO",
  };

  return {
    case: {
      titulo: title.trim(),
      descripcion: description.trim() || category.trim(),
      objetivo: learningObjective.trim() || null,
      nivelDificultad: backendDifficulty[difficulty],
      duracionEstimada: durationMinutes,
    },
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
        },
        options: question.options.map((option, optionIndex) => ({
          texto: option.texto.trim(),
          descripcion: option.descripcion.trim() || null,
          orden: optionIndex + 1,
          activo: true,
        })),
      })),
    })),
  };
}

export function CreateCaseForm() {
  const router = useRouter();
  const createCaseBundle = useCreateCaseBundle();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Simulación clínica");
  const [difficulty, setDifficulty] = useState<CaseDifficulty>("intermediate");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [patientModel, setPatientModel] = useState<PatientLive2DModel>("haru");
  const [learningObjective, setLearningObjective] = useState("");
  const [scenes, setScenes] = useState<FormScene[]>([createDefaultScene(0)]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
                      options: [...question.options, createDefaultOption()],
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

    const validationError = validateForm(title, scenes);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const bundle = await createCaseBundle.mutateAsync(
        buildBundleRequest(
          title,
          description,
          category,
          difficulty,
          durationMinutes,
          learningObjective,
          scenes
        )
      );

      router.push(`/simulator/${bundle.caso.id}`);
    } catch {
      setError("No se pudo guardar el caso. Intenta de nuevo.");
      setSaving(false);
    }
  };

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
          <Label htmlFor="objective">Objetivo de aprendizaje</Label>
          <Input
            id="objective"
            value={learningObjective}
            onChange={(e) => setLearningObjective(e.target.value)}
            placeholder="Ej. Validar emociones antes de intervenir"
          />
        </div>
      </Surface>

      {scenes.map((scene, sceneIndex) => (
        <Surface key={scene.id} className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">
              Escena {sceneIndex + 1}
            </h2>
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
                  <h3 className="text-sm font-semibold">
                    Pregunta {questionIndex + 1}
                  </h3>
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

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Opciones</p>
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="grid gap-3 rounded-lg border border-border/40 bg-background p-3 sm:grid-cols-[1fr_1fr_auto]"
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
          {saving ? "Guardando…" : "Crear y publicar caso"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
