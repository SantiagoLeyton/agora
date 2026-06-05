"use client";

import { BarChart3, Users, ClipboardList, MessageSquareText } from "lucide-react";
import {
  HeroSection,
  MetricGrid,
  Surface,
  SectionHeader,
  CompetencyRadar,
} from "@/components/design-system";
import { mockTeacherStats } from "@/mocks";
import { Progress } from "@/components/ui/progress";
import { getPageHeroMeta } from "@/lib/page-meta";
import type { EvaluationMetric } from "@/types";

const teacherMetricIcons = {
  "Estudiantes activos": Users,
  "Promedio grupal": BarChart3,
  "Asignaciones activas": ClipboardList,
  "Estudiantes en riesgo": MessageSquareText,
};

const competencyMetrics = [
  { label: "Empatía clínica", value: 78, group: "Grupo A" },
  { label: "Evaluación de riesgo", value: 72, group: "Grupo A" },
  { label: "Comunicación terapéutica", value: 85, group: "Grupo B" },
  { label: "Toma de decisiones", value: 69, group: "Grupo C" },
];

const groupRadarMetrics: EvaluationMetric[] = [
  { id: "1", label: "Empatía", value: 78, maxValue: 100, description: "" },
  { id: "2", label: "Exploración", value: 72, maxValue: 100, description: "" },
  { id: "3", label: "Comunicación", value: 85, maxValue: 100, description: "" },
  { id: "4", label: "Decisiones", value: 69, maxValue: 100, description: "" },
  { id: "5", label: "Riesgo", value: 74, maxValue: 100, description: "" },
];

export default function TeacherMetricsPage() {
  const meta = getPageHeroMeta("/teacher/metrics");

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      <MetricGrid stats={mockTeacherStats} icons={teacherMetricIcons} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHeader title="Competencias por grupo" />
          <div className="mt-5 space-y-5">
            {competencyMetrics.map((m) => (
              <div key={`${m.label}-${m.group}`}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{m.label}</span>
                  <span className="text-muted-foreground">{m.group}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={m.value} className="flex-1" />
                  <span className="w-10 text-right text-sm font-medium tabular-nums">{m.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <CompetencyRadar metrics={groupRadarMetrics} />
      </div>

      <Surface variant="muted">
        <SectionHeader title="Resumen del semestre" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Sesiones completadas", value: "142" },
            { label: "Promedio institucional", value: "74%", accent: "text-primary" },
            { label: "Estudiantes en riesgo", value: "3", accent: "text-brand" },
            { label: "Caso más practicado", value: "Ansiedad universitaria" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between rounded-lg border border-border/40 bg-background/50 p-3 text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`font-semibold ${row.accent ?? ""}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
