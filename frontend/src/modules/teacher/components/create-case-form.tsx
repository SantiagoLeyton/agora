"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Surface } from "@/components/design-system";
import { LIVE2D_MODELS } from "@/lib/live2d-models";
import { useCreateCaseBundle } from "@/hooks/use-data";
import type { CaseDifficulty, PatientLive2DModel } from "@/types";

const fieldClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CreateCaseForm() {
  const router = useRouter();
  const createCaseBundle = useCreateCaseBundle();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Simulación clínica");
  const [difficulty, setDifficulty] = useState<CaseDifficulty>("intermediate");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [patientModel, setPatientModel] = useState<PatientLive2DModel>("haru");
  const [patientName, setPatientName] = useState("");
  const [setting, setSetting] = useState("Consultorio universitario");
  const [narrative, setNarrative] = useState("");
  const [learningObjective, setLearningObjective] = useState("");
  const [optionExplore, setOptionExplore] = useState("Explorar emociones");
  const [optionAssess, setOptionAssess] = useState("Evaluar clínicamente");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("El título del caso es obligatorio.");
      return;
    }
    if (!narrative.trim()) {
      setError("El relato del paciente en la primera escena es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const backendDifficulty: Record<CaseDifficulty, string> = {
        basic: "BASICO",
        intermediate: "INTERMEDIO",
        advanced: "AVANZADO",
      };
      const bundle = await createCaseBundle.mutateAsync({
        case: {
          titulo: title.trim(),
          descripcion: description.trim() || category.trim(),
          objetivo: learningObjective.trim() || null,
          nivelDificultad: backendDifficulty[difficulty],
          duracionEstimada: durationMinutes,
        },
        scene: {
          orden: 1,
          titulo: patientName.trim() || "Primera escena",
          descripcion: setting.trim() || null,
          contenido: narrative.trim(),
          activo: true,
        },
        question: {
          enunciado: "Selecciona la intervencion clinica inicial.",
          obligatoria: true,
          activo: true,
        },
        options: [
          {
            texto: optionExplore.trim(),
            descripcion: "Exploracion inicial del motivo de consulta.",
            orden: 1,
            activo: true,
          },
          {
            texto: optionAssess.trim(),
            descripcion: "Evaluacion clinica inicial.",
            orden: 2,
            activo: true,
          },
        ],
      });

      router.push(`/simulator/${bundle.caso.id}`);
    } catch {
      setError("No se pudo guardar el caso. Intenta de nuevo.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <Surface className="space-y-5 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">Datos del caso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            El caso se guarda en este navegador y aparece en el repositorio del simulador.
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

      <Surface className="space-y-5 p-6">
        <h2 className="font-display text-lg font-semibold">Primera escena</h2>

        <div className="space-y-2">
          <Label htmlFor="patientName">Nombre del paciente</Label>
          <Input
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Ej. Ana Martínez"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setting">Escenario</Label>
          <Input
            id="setting"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="narrative">Relato del paciente *</Label>
          <textarea
            id="narrative"
            className={`${fieldClass} min-h-[120px] py-2`}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Texto que verá el estudiante como primera intervención del paciente"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="optExplore">Opción — exploración</Label>
            <Input
              id="optExplore"
              value={optionExplore}
              onChange={(e) => setOptionExplore(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="optAssess">Opción — evaluación</Label>
            <Input
              id="optAssess"
              value={optionAssess}
              onChange={(e) => setOptionAssess(e.target.value)}
            />
          </div>
        </div>
      </Surface>

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
