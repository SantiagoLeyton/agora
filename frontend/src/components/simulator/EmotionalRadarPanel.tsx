"use client";

import { CompetencyRadar } from "@/components/design-system";
import { Surface, SectionHeader } from "@/components/design-system";
import { mapStatesToMetrics } from "@/lib/evaluation-adapters";
import type { SimulationStateResponse } from "@/types/simulation";

const EMOTIONAL_AXES = [
  "ANSIEDAD",
  "ESTRES",
  "CONFIANZA",
  "COOPERACION",
  "RESISTENCIA",
] as const;

interface EmotionalRadarPanelProps {
  states?: SimulationStateResponse[];
  className?: string;
}

export function EmotionalRadarPanel({ states, className }: EmotionalRadarPanelProps) {
  if (!states?.length) {
    return (
      <Surface className={className}>
        <SectionHeader
          title="Radar emocional"
          description="Los estados se cargan desde el intento activo."
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Responde una intervención para ver el perfil emocional persistido.
        </p>
      </Surface>
    );
  }

  const ordered = EMOTIONAL_AXES.map((name) =>
    states.find((state) => state.nombre.toUpperCase() === name)
  ).filter((state): state is SimulationStateResponse => Boolean(state));

  const metrics = mapStatesToMetrics(ordered.length > 0 ? ordered : states);

  return (
    <div className={className}>
      <CompetencyRadar metrics={metrics} />
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {metrics.map((metric) => (
          <div key={metric.id} className="rounded-lg border border-border/50 px-2 py-1.5">
            <span className="font-medium text-foreground">{metric.label}</span>
            <span className="ml-2 tabular-nums">{metric.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
