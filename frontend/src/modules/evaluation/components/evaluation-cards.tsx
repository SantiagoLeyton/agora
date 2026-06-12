"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Surface, InsightHighlight } from "@/components/design-system";
import type { EvaluationResult } from "@/types";
import { formatScoreLabel } from "@/lib/evaluation-adapters";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EvaluationOverviewProps {
  evaluations: EvaluationResult[];
}

export function EvaluationOverview({ evaluations }: EvaluationOverviewProps) {
  const scoredEvaluations = evaluations.filter((e) => e.score !== null);
  const avgScore =
    scoredEvaluations.length > 0
      ? scoredEvaluations.reduce((s, e) => s + (e.score ?? 0), 0) /
        scoredEvaluations.length
      : null;
  const latest = evaluations[0];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Surface className="relative overflow-hidden lg:col-span-1">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-success/10 blur-2xl" />
        <p className="text-sm font-medium text-muted-foreground">Evolución formativa</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums">
          {formatScoreLabel(avgScore)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs text-success">
          <TrendingUp className="h-3 w-3" />
          Progreso sostenido en el semestre
        </p>
      </Surface>

      {latest && (
        <Surface hover className="lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-2 text-[10px]">
                Última sesión evaluada
              </Badge>
              <h3 className="font-display text-lg font-semibold">{latest.caseTitle}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(latest.completedAt), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <InsightHighlight
              label="Puntuación clínica"
              value={formatScoreLabel(latest.score)}
            />
          </div>
          <p className="mt-4 border-l-2 border-primary/25 pl-4 text-sm leading-relaxed text-muted-foreground">
            {latest.feedback[0]}
          </p>
          <Button asChild variant="link" className="mt-3 h-auto p-0">
            <Link href={`/evaluation/results/${latest.id}`}>
              Ver análisis completo
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </Surface>
      )}
    </div>
  );
}

interface EvaluationCardProps {
  result: EvaluationResult;
  index: number;
}

export function EvaluationCard({ result, index }: EvaluationCardProps) {
  const scoreColor =
    result.score === null
      ? "text-muted-foreground"
      : result.score >= 4
        ? "text-success"
        : result.score >= 3
          ? "text-foreground"
          : "text-warning";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2 }}
    >
      <Surface hover padding="none" className="overflow-hidden">
        <div className="border-b border-border/50 bg-gradient-to-r from-primary/[0.04] to-transparent px-5 py-4">
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Retroalimentación clínica
              </p>
              <h3 className="mt-1 font-display text-base font-semibold leading-snug">
                {result.caseTitle}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(result.completedAt), "d MMM yyyy", { locale: es })}
              </div>
            </div>
            <p className={cn("font-display text-2xl font-semibold tabular-nums", scoreColor)}>
              {formatScoreLabel(result.score)}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            {result.metrics.length > 0 ? result.metrics.slice(0, 4).map((metric) => (
              <div key={metric.id} className="rounded-lg border border-border/40 bg-muted/15 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground line-clamp-1">{metric.label}</span>
                  <span className="font-semibold tabular-nums">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="mt-2 h-1" />
              </div>
            )) : (
              <div className="col-span-2 rounded-lg border border-border/40 bg-muted/15 p-3 text-xs text-muted-foreground">
                Sin métricas cuantitativas registradas.
              </div>
            )}
          </div>

          <div className="rounded-lg bg-primary/[0.04] p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Insight del supervisor
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {result.feedback[0]}
            </p>
          </div>

          {result.strengths.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {result.strengths.slice(0, 2).map((s) => (
              <Badge key={s} variant="success" className="text-[10px] font-normal">
                {s}
              </Badge>
            ))}
          </div>
          )}

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/evaluation/results/${result.id}`}>
              Ver retroalimentación detallada
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </Surface>
    </motion.article>
  );
}

export function MetricsOverview({ metrics }: { metrics: EvaluationResult["metrics"] }) {
  if (metrics.length === 0) {
    return (
      <Surface variant="muted" className="py-10 text-center text-sm text-muted-foreground">
        Sin métricas cuantitativas registradas para este intento.
      </Surface>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <Surface>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{metric.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{metric.description}</p>
              </div>
              <span className="font-display text-3xl font-semibold tabular-nums text-primary">
                {metric.value}
              </span>
            </div>
            <Progress value={metric.value} className="mt-4 h-2" />
          </Surface>
        </motion.div>
      ))}
    </div>
  );
}
