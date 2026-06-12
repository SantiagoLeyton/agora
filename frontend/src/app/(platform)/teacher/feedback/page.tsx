"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeroSection, PageLoading, Surface } from "@/components/design-system";
import { useCreateFeedback, useTeacherFeedbackQueue } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";
import type { TeacherFeedbackItem } from "@/lib/teacher-feedback-adapters";
import { ApiError } from "@/services/api-error";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const fieldClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function TeacherFeedbackPage() {
  const meta = getPageHeroMeta("/teacher/feedback");
  const { data: feedbackItems, isLoading, isError, error } = useTeacherFeedbackQueue();
  const createFeedback = useCreateFeedback();

  const [selectedItem, setSelectedItem] = useState<TeacherFeedbackItem | null>(null);
  const [contenido, setContenido] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openRespondForm = (item: TeacherFeedbackItem) => {
    setSelectedItem(item);
    setContenido("");
    setObservaciones("");
    setFormError(null);
  };

  const closeRespondForm = () => {
    if (createFeedback.isPending) return;
    setSelectedItem(null);
    setContenido("");
    setObservaciones("");
    setFormError(null);
  };

  const handleSubmitFeedback = () => {
    if (!selectedItem) return;

    const trimmedContent = contenido.trim();
    if (!trimmedContent) {
      setFormError("La retroalimentación es obligatoria.");
      return;
    }

    setFormError(null);
    createFeedback.mutate(
      {
        attemptId: selectedItem.attemptId,
        request: {
          contenido: trimmedContent,
          observaciones: observaciones.trim() || null,
        },
      },
      {
        onSuccess: () => {
          const studentName = selectedItem.studentName;
          setSelectedItem(null);
          setContenido("");
          setObservaciones("");
          setFormError(null);
          setSuccessMessage(`Retroalimentación enviada para ${studentName}.`);
        },
        onError: (mutationError) => {
          if (mutationError instanceof ApiError) {
            if (mutationError.status === 403) {
              setFormError(
                "No tienes permiso para retroalimentar este intento. Verifica que la simulación esté vinculada a tu programación."
              );
              return;
            }
            setFormError(mutationError.message);
            return;
          }
          setFormError("No se pudo enviar la retroalimentación. Intenta de nuevo.");
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      {successMessage && (
        <Surface variant="muted" className="flex items-start gap-3 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p>{successMessage}</p>
        </Surface>
      )}

      {isLoading ? (
        <PageLoading />
      ) : isError ? (
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          {error instanceof ApiError
            ? error.message
            : "No se pudieron cargar los intentos para retroalimentación."}
        </Surface>
      ) : !feedbackItems?.length ? (
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          No hay intentos finalizados disponibles para retroalimentación.
        </Surface>
      ) : (
        <div className="space-y-3">
          {feedbackItems.map((item) => (
            <Surface key={item.attemptId} hover>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{item.studentName}</p>
                    <p className="text-sm text-muted-foreground">{item.caseTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Finalizado{" "}
                      {format(new Date(item.completedAt), "d MMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">{item.comment}</p>
                    {item.teacherFeedback?.observaciones && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Observaciones: {item.teacherFeedback.observaciones}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={item.status === "pendiente" ? "warning" : "success"}>
                    {item.status === "pendiente" ? "Pendiente" : "Revisado"}
                  </Badge>
                  {item.status === "pendiente" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRespondForm(item)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Responder
                    </Button>
                  )}
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={closeRespondForm}
        >
          <Surface
            className="w-full max-w-lg space-y-4 p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <h2 id="feedback-dialog-title" className="font-display text-lg font-semibold">
                Responder retroalimentación
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedItem.studentName} · {selectedItem.caseTitle}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-contenido">Retroalimentación *</Label>
              <textarea
                id="feedback-contenido"
                className={`${fieldClass} min-h-[120px] py-2`}
                value={contenido}
                onChange={(event) => setContenido(event.target.value)}
                placeholder="Escribe observaciones clínicas formativas para el estudiante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-observaciones">Observaciones adicionales</Label>
              <Input
                id="feedback-observaciones"
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
                placeholder="Opcional"
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeRespondForm}
                disabled={createFeedback.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="brand"
                onClick={handleSubmitFeedback}
                disabled={createFeedback.isPending}
              >
                {createFeedback.isPending ? "Enviando…" : "Enviar retroalimentación"}
              </Button>
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
}
