"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface, SectionHeader } from "@/components/design-system";
import type { AcademicProgressResponse } from "@/types/pedagogical";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AcademicProgressTimelineProps {
  progress: AcademicProgressResponse;
}

export function AcademicProgressTimeline({ progress }: AcademicProgressTimelineProps) {
  return (
    <div className="space-y-6">
      <Surface>
        <SectionHeader
          title={`Evolución académica · ${progress.studentName}`}
          description="Histórico longitudinal basado en intentos finalizados, notas y cumplimiento de RDA."
        />
        <div className="mt-4 space-y-4">
          {progress.attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay intentos finalizados registrados.
            </p>
          ) : (
            progress.attempts.map((attempt, index) => (
              <div
                key={attempt.attemptId}
                className="rounded-xl border border-border/60 bg-muted/10 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Intento {index + 1}</p>
                    <h3 className="font-medium">{attempt.casoTitulo}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {attempt.fechaFin
                        ? format(new Date(attempt.fechaFin), "d MMM yyyy, HH:mm", { locale: es })
                        : "Sin fecha de cierre"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {attempt.notaFinal != null
                        ? `${Number(attempt.notaFinal).toFixed(1)} / 5`
                        : "Sin nota"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {attempt.feedbackCount} feedback · {attempt.aiSummaryCount} IA
                    </p>
                  </div>
                </div>
                {attempt.rdaEvaluations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attempt.rdaEvaluations.map((rda) => (
                      <Badge key={`${attempt.attemptId}-${rda.rdaId}`} variant="outline">
                        {rda.descripcion}: {rda.compliancePct.toFixed(0)}%
                      </Badge>
                    ))}
                  </div>
                )}
                <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
                  <Link href={`/evaluation/results/${attempt.attemptId}`}>Ver detalle</Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </Surface>

      {progress.rdaTrends.length > 0 && (
        <Surface>
          <SectionHeader
            title="Tendencia por RDA"
            description="Evolución del cumplimiento por resultado de aprendizaje a lo largo de los intentos."
          />
          <div className="mt-4 space-y-4">
            {progress.rdaTrends.map((trend) => (
              <div key={trend.rdaId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="font-medium">{trend.descripcion}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trend.samples.map((sample) => (
                    <Badge key={`${trend.rdaId}-${sample.attemptId}`} variant="secondary">
                      {sample.compliancePct.toFixed(0)}%
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Surface>
      )}
    </div>
  );
}
