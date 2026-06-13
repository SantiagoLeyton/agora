"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  ArrowRight,
  BookOpen,
  Stethoscope,
  Target,
  Layers,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SimulationCase } from "@/types";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";

const difficultyConfig = {
  basic: { label: "Básico", className: "text-success bg-success/10 border-success/25" },
  intermediate: { label: "Intermedio", className: "text-warning bg-warning/10 border-warning/25" },
  advanced: { label: "Avanzado", className: "text-brand bg-brand/10 border-brand/25" },
};

const statusConfig = {
  not_started: { label: "Sin iniciar", dot: "bg-muted-foreground/50", chip: "muted" as const },
  in_progress: { label: "En curso", dot: "bg-info shadow-[0_0_8px_hsl(var(--info)/0.5)]", chip: "outline" as const },
  completed: { label: "Completado", dot: "bg-success", chip: "success" as const },
};

interface ClinicalCaseCardProps {
  caseItem: SimulationCase;
  index?: number;
}

export function ClinicalCaseCard({ caseItem, index = 0 }: ClinicalCaseCardProps) {
  const diff = difficultyConfig[caseItem.difficulty];
  const status = statusConfig[caseItem.status];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * tokens.motion.stagger, duration: 0.45, ease: tokens.motion.easeOut }}
      whileHover={{ y: -4, transition: { duration: tokens.motion.fast } }}
      className="group h-full"
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60",
          "bg-gradient-to-br from-card via-card to-muted/30",
          "shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--surface-ring))]",
          "transition-[box-shadow,border-color] duration-300",
          "hover:border-primary/15 hover:shadow-[var(--shadow-lg)]"
        )}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/[0.04] blur-2xl transition-opacity group-hover:opacity-100" />

        <div className="relative border-b border-border/45 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.09] text-primary shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.12)]">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {caseItem.category}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                  <Badge variant={status.chip} className="h-5 px-1.5 text-[9px]">
                    Expediente
                  </Badge>
                </div>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold",
                diff.className
              )}
            >
              {diff.label}
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight line-clamp-2">
            {caseItem.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {caseItem.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-2 py-1">
              <Clock className="h-3 w-3" />
              {caseItem.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-2 py-1">
              <Layers className="h-3 w-3" />
              Narrativa
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/40 px-2 py-1">
              <Activity className="h-3 w-3" />
              Simulación guiada
            </span>
          </div>

          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Target className="h-3 w-3" />
              Competencias
            </p>
            <ul className="space-y-1.5">
              {caseItem.learningObjectives.slice(0, 2).map((obj) => (
                <li key={obj} className="flex items-start gap-2 text-xs text-foreground/90">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <span className="line-clamp-1">{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {caseItem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {caseItem.progress > 0 && (
            <div className="mt-4 space-y-1.5 rounded-lg border border-border/40 bg-primary/[0.03] p-3">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-muted-foreground">Progreso clínico</span>
                <span className="font-semibold tabular-nums text-primary">{caseItem.progress}%</span>
              </div>
              <Progress value={caseItem.progress} className="h-1.5" />
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 border-t border-border/40 pt-4">
            <Button asChild variant="outline" size="sm" className="w-full bg-card/80">
              <Link
                href={
                  caseItem.programacionActivaId
                    ? `/simulator/${caseItem.id}?programacionId=${caseItem.programacionActivaId}`
                    : `/simulator/${caseItem.id}`
                }
              >
                <BookOpen className="h-3.5 w-3.5" />
                Ver expediente
              </Link>
            </Button>
            {caseItem.presentable ? (
              <Button asChild size="sm" className="w-full shadow-[var(--shadow-sm)]">
                <Link
                  href={`/simulator/${caseItem.id}?programacionId=${caseItem.programacionActivaId}`}
                >
                  Presentar caso
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : caseItem.mensajePresentacion ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                {caseItem.mensajePresentacion}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function ClinicalCaseGrid({ cases }: { cases: SimulationCase[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {cases.map((caseItem, index) => (
        <ClinicalCaseCard key={caseItem.id} caseItem={caseItem} index={index} />
      ))}
    </div>
  );
}
