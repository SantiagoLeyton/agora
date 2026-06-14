"use client";

import { Surface, SectionHeader } from "@/components/design-system";
import { Progress } from "@/components/ui/progress";
import type { GradebookAnalytics } from "@/types/gradebook";

interface GradebookAnalyticsPanelProps {
  analytics?: GradebookAnalytics | null;
}

export function GradebookAnalyticsPanel({ analytics }: GradebookAnalyticsPanelProps) {
  if (!analytics) {
    return (
      <Surface variant="muted" className="py-8 text-center text-sm text-muted-foreground">
        Sin datos analíticos para los filtros seleccionados.
      </Surface>
    );
  }

  const maxDistribution = Math.max(
    1,
    ...analytics.distribucion.map((item) => item.cantidad)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Surface>
        <SectionHeader
          title="Resumen del curso"
          description={`Umbral de aprobación: ${analytics.umbralAprobacion.toFixed(1)} / 5.0`}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Promedio", value: analytics.promedioCurso.toFixed(2) },
            { label: "Mejor nota", value: analytics.mejorNota.toFixed(2) },
            { label: "Peor nota", value: analytics.peorNota.toFixed(2) },
            { label: "Aprobados", value: String(analytics.aprobados) },
            { label: "Reprobados", value: String(analytics.reprobados) },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between rounded-lg border border-border/40 bg-muted/20 p-3 text-sm"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>
      </Surface>

      <Surface>
        <SectionHeader title="Distribución de notas" description="Intentos con calificación registrada" />
        <div className="mt-4 space-y-3">
          {analytics.distribucion.map((bucket) => (
            <div key={bucket.rango}>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{bucket.rango}</span>
                <span>{bucket.cantidad}</span>
              </div>
              <Progress value={(bucket.cantidad / maxDistribution) * 100} className="h-1.5" />
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
