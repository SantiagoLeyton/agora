"use client";

import { Sparkles, UserRound } from "lucide-react";
import { Surface, SectionHeader } from "@/components/design-system";
import type { AISummaryResponse, FeedbackResponse } from "@/types/simulation";

export interface FeedbackComparisonData {
  teacher: FeedbackResponse[];
  system: FeedbackResponse[];
  ai: AISummaryResponse[];
}

interface FeedbackComparisonPanelProps {
  data: FeedbackComparisonData;
}

function FeedbackBlock({
  title,
  icon: Icon,
  lines,
  emptyMessage,
}: {
  title: string;
  icon: typeof UserRound;
  lines: string[];
  emptyMessage: string;
}) {
  return (
    <Surface className="h-full">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{title}</h3>
      </div>
      {lines.length > 0 ? (
        <div className="space-y-3">
          {lines.map((line, index) => (
            <p
              key={`${title}-${index}`}
              className="border-l-2 border-border/70 pl-3 text-sm leading-relaxed text-muted-foreground"
            >
              {line}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </Surface>
  );
}

export function FeedbackComparisonPanel({ data }: FeedbackComparisonPanelProps) {
  const teacherLines = data.teacher.flatMap((item) => {
    const lines = [item.contenido];
    if (item.observaciones) lines.push(item.observaciones);
    return lines;
  });

  const systemLines = data.system.map((item) => item.contenido);

  const aiLines = data.ai.flatMap((item) => {
    const prefix = item.fueExitosa
      ? `[${item.modeloUtilizado}]`
      : "[Respuesta alternativa]";
    const lines = [`${prefix} ${item.respuestaGenerada}`];
    if (!item.fueExitosa && item.mensajeError) {
      lines.push(`Detalle: ${item.mensajeError}`);
    }
    return lines;
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Comparación docente vs IA"
        description="Lectura paralela de retroalimentación humana y síntesis automatizada, sin modificar el contenido original."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <FeedbackBlock
          title="Retroalimentación docente"
          icon={UserRound}
          lines={teacherLines.length > 0 ? teacherLines : systemLines}
          emptyMessage="Aún no hay retroalimentación docente registrada para este intento."
        />
        <FeedbackBlock
          title="Retroalimentación IA"
          icon={Sparkles}
          lines={aiLines}
          emptyMessage="Aún no hay síntesis IA generada para este intento."
        />
      </div>
    </div>
  );
}
