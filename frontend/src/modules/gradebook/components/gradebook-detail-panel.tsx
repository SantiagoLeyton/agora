"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface, SectionHeader } from "@/components/design-system";
import { DataTable } from "@/components/design-system/data-table";
import { EmotionalRadarPanel } from "@/components/simulator/EmotionalRadarPanel";
import { RdaEvaluationPanel } from "@/modules/evaluation/components/rda-evaluation-panel";
import type { GradebookDetail } from "@/types/gradebook";

interface GradebookDetailPanelProps {
  detail: GradebookDetail;
  onClose: () => void;
}

function formatGrade(nota: number | null | undefined) {
  if (nota == null) return "Sin calificar";
  return `${nota.toFixed(1)} / 5.0`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return format(new Date(value), "d MMM yyyy, HH:mm", { locale: es });
}

export function GradebookDetailPanel({ detail, onClose }: GradebookDetailPanelProps) {
  const { entry, summary, analysis, historial } = detail;
  const estados = analysis.estadosFinales ?? summary.estados ?? [];
  const rdaItems = [...(analysis.rdaAlcanzados ?? []), ...(analysis.rdaPendientes ?? [])];

  return (
    <Surface className="space-y-6 border-primary/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionHeader
            title={entry.estudianteNombre}
            description={`${entry.casoTitulo} · ${entry.grupoNombre ?? "Sin curso"}`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={entry.aprobado ? "success" : "destructive"}>
              {formatGrade(entry.notaFinal)}
            </Badge>
            <Badge variant="outline">{entry.estado}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cerrar detalle
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EmotionalRadarPanel states={estados} />
        <Surface>
          <SectionHeader title="Consecuencias acumuladas" />
          <div className="mt-4 space-y-3">
            {(analysis.consecuenciasAcumuladas ?? []).length > 0 ? (
              analysis.consecuenciasAcumuladas.map((item) => (
                <div key={item.respuestaId} className="rounded-xl border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">{item.pregunta}</p>
                  <p className="mt-1 text-sm font-medium">{item.mensaje ?? item.opcion}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin consecuencias registradas.</p>
            )}
          </div>
        </Surface>
      </div>

      <Surface>
        <SectionHeader title="Respuestas del intento" />
        <div className="mt-4 space-y-3">
          {summary.respuestas.length > 0 ? (
            summary.respuestas.map((answer) => (
              <div key={answer.id} className="rounded-xl border border-border/50 p-3">
                <p className="text-xs text-muted-foreground">{answer.pregunta}</p>
                <p className="mt-1 text-sm">{answer.opcion}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sin respuestas registradas.</p>
          )}
        </div>
      </Surface>

      <RdaEvaluationPanel items={rdaItems} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHeader title="Feedback docente" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {entry.feedbackDocente ?? "Sin retroalimentación docente registrada."}
          </p>
        </Surface>
        <Surface>
          <SectionHeader title="Feedback IA" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {entry.feedbackIa ?? "Sin retroalimentación IA registrada."}
          </p>
        </Surface>
      </div>

      <Surface padding="none">
        <div className="border-b border-border/50 px-5 py-4">
          <SectionHeader title="Histórico de intentos" description="Mismo estudiante y caso" />
        </div>
        <DataTable
          data={historial}
          keyExtractor={(row) => String(row.attemptId)}
          emptyMessage="Sin intentos previos."
          columns={[
            { key: "fecha", header: "Fecha", cell: (row) => formatDate(row.fechaPresentacion) },
            { key: "estado", header: "Estado", cell: (row) => row.estado },
            {
              key: "nota",
              header: "Nota",
              cell: (row) => formatGrade(row.notaFinal),
            },
          ]}
        />
      </Surface>
    </Surface>
  );
}
