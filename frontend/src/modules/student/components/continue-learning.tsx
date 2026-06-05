"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Surface, SectionHeader } from "@/components/design-system";
import { mockCases } from "@/mocks";
import { cn } from "@/lib/utils";

const statusConfig = {
  in_progress: { label: "En progreso", variant: "outline" as const, accent: "border-l-info" },
  not_started: { label: "Pendiente", variant: "muted" as const, accent: "border-l-border" },
  completed: { label: "Completado", variant: "success" as const, accent: "border-l-success" },
};

export function ContinueLearning() {
  const activeCases = mockCases.filter((c) => c.status !== "completed").slice(0, 3);

  return (
    <Surface>
      <SectionHeader
        title="Tu ruta de aprendizaje"
        description="Simulaciones clínicas asignadas y en curso"
      />
      <div className="mt-5 space-y-3">
        {activeCases.map((caseItem, index) => {
          const status = statusConfig[caseItem.status];
          return (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className={cn(
                "flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/15 p-4 sm:flex-row sm:items-center",
                "border-l-[3px] transition-colors hover:bg-muted/30",
                status.accent
              )}
            >
              <div className="flex flex-1 gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {caseItem.category}
                    </Badge>
                    <Badge variant={status.variant} className="text-[10px]">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="mt-1.5 font-medium leading-snug">{caseItem.title}</p>
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {caseItem.durationMinutes} min
                    </span>
                  </div>
                  {caseItem.progress > 0 && <Progress value={caseItem.progress} className="mt-2 h-1" />}
                </div>
              </div>
              <Button asChild size="sm" variant={caseItem.status === "in_progress" ? "default" : "outline"}>
                <Link href={`/simulator/${caseItem.id}/play`}>
                  {caseItem.status === "in_progress" ? (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Continuar
                    </>
                  ) : (
                    <>
                      Iniciar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </Surface>
  );
}
