"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface, SectionHeader } from "@/components/design-system";
import type { PedagogicalInsights } from "@/types/pedagogical";

interface PedagogicalInsightsPanelProps {
  insights: PedagogicalInsights;
}

export function PedagogicalInsightsPanel({ insights }: PedagogicalInsightsPanelProps) {
  const hasData =
    insights.rdaSummary.length > 0 ||
    insights.studentsRequiringAttention.length > 0 ||
    insights.positiveProgressStudents.length > 0 ||
    insights.averageGrade != null;

  if (!hasData) {
    return (
      <Surface variant="muted" className="py-8 text-center text-sm text-muted-foreground">
        Aún no hay datos pedagógicos suficientes para generar indicadores agregados.
      </Surface>
    );
  }

  return (
    <div className="space-y-6">
      <Surface>
        <SectionHeader
          title="Indicadores pedagógicos"
          description="Agregaciones derivadas de intentos finalizados, notas y cumplimiento de RDA."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <p className="text-xs text-muted-foreground">Promedio de notas</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {insights.averageGrade != null
                ? `${insights.averageGrade.toFixed(1)} / 5`
                : "N/D"}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <p className="text-xs text-muted-foreground">RDA evaluados</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {insights.rdaSummary.length}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <p className="text-xs text-muted-foreground">Estudiantes con progreso</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {insights.positiveProgressStudents.length}
            </p>
          </div>
        </div>
      </Surface>

      {insights.rdaSummary.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface>
            <SectionHeader
              title="RDA con mayor cumplimiento"
              description="Resultados de aprendizaje con mejor desempeño promedio."
            />
            <div className="mt-4 space-y-3">
              {[...insights.rdaSummary]
                .sort((a, b) => b.avgCompliancePct - a.avgCompliancePct)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.descripcion}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3 text-sm"
                  >
                    <span className="line-clamp-2">{item.descripcion}</span>
                    <Badge variant="success">{item.avgCompliancePct.toFixed(0)}%</Badge>
                  </div>
                ))}
            </div>
          </Surface>

          <Surface>
            <SectionHeader
              title="RDA con mayores dificultades"
              description="Resultados que requieren refuerzo formativo."
            />
            <div className="mt-4 space-y-3">
              {[...insights.rdaSummary]
                .sort((a, b) => a.avgCompliancePct - b.avgCompliancePct)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={`diff-${item.descripcion}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 p-3 text-sm"
                  >
                    <span className="line-clamp-2">{item.descripcion}</span>
                    <Badge variant="warning">{item.avgCompliancePct.toFixed(0)}%</Badge>
                  </div>
                ))}
            </div>
          </Surface>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHeader
            title="Progreso positivo"
            description="Estudiantes con tendencia ascendente en notas."
          />
          <div className="mt-4 space-y-3">
            {insights.positiveProgressStudents.length > 0 ? (
              insights.positiveProgressStudents.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span>{student.studentName}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {student.latestGrade != null
                      ? `${student.latestGrade.toFixed(1)} / 5`
                      : "N/D"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin estudiantes con tendencia positiva identificada en este periodo.
              </p>
            )}
          </div>
        </Surface>

        <Surface>
          <SectionHeader
            title="Requieren seguimiento"
            description="Estudiantes con notas bajas o tendencia descendente."
          />
          <div className="mt-4 space-y-3">
            {insights.studentsRequiringAttention.length > 0 ? (
              insights.studentsRequiringAttention.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span>{student.studentName}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {student.latestGrade != null
                      ? `${student.latestGrade.toFixed(1)} / 5`
                      : "N/D"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin estudiantes marcados para seguimiento en este periodo.
              </p>
            )}
          </div>
        </Surface>
      </div>
    </div>
  );
}
