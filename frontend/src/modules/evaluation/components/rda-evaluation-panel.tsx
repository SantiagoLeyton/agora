"use client";

import { CheckCircle2, AlertCircle, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface, SectionHeader } from "@/components/design-system";
import type { RdaComplianceStatus, RdaEvaluationItem } from "@/types/pedagogical";

function statusMeta(status: RdaComplianceStatus) {
  switch (status) {
    case "CUMPLIDO":
      return {
        label: "Cumplido",
        icon: CheckCircle2,
        variant: "success" as const,
      };
    case "PARCIALMENTE_CUMPLIDO":
      return {
        label: "Parcialmente cumplido",
        icon: CircleDashed,
        variant: "warning" as const,
      };
    default:
      return {
        label: "No evidenciado",
        icon: AlertCircle,
        variant: "muted" as const,
      };
  }
}

interface RdaEvaluationPanelProps {
  items: RdaEvaluationItem[];
}

export function RdaEvaluationPanel({ items }: RdaEvaluationPanelProps) {
  if (!items.length) {
    return (
      <Surface variant="muted" className="py-8 text-center text-sm text-muted-foreground">
        Este caso no tiene resultados de aprendizaje evaluables para este intento.
      </Surface>
    );
  }

  return (
    <Surface>
      <SectionHeader
        title="Cumplimiento de resultados de aprendizaje"
        description="Evaluación derivada de respuestas y ponderación académica real del intento."
      />
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const meta = statusMeta(item.estado);
          const Icon = meta.icon;
          return (
            <div
              key={item.rdaId}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">{item.descripcion}</p>
                <p className="text-xs text-muted-foreground">
                  {item.preguntasEvaluadas}/{item.preguntasTotales} preguntas evaluadas ·{" "}
                  {item.compliancePct.toFixed(0)}% cumplimiento
                </p>
              </div>
              <Badge variant={meta.variant} className="w-fit gap-1">
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
