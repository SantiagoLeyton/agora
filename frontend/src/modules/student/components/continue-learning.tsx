"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Surface, SectionHeader } from "@/components/design-system";
import { useMyAssignedSessions } from "@/hooks/use-data";
import { assignedSessionStatusLabel } from "@/lib/student-session-adapters";
import { cn } from "@/lib/utils";

export function ContinueLearning() {
  const { data: sessions = [] } = useMyAssignedSessions();
  const activeSessions = sessions.slice(0, 3);

  return (
    <Surface>
      <SectionHeader
        title="Tu ruta de aprendizaje"
        description="Simulaciones asignadas desde tus cursos"
      />
      <div className="mt-5 space-y-3">
        {activeSessions.length > 0 ? (
          activeSessions.map((session, index) => (
            <motion.div
              key={session.scheduleId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className={cn(
                "flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/15 p-4 sm:flex-row sm:items-center",
                "border-l-[3px] border-l-primary/40"
              )}
            >
              <div className="flex flex-1 gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {session.groupName}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {assignedSessionStatusLabel(session.status)}
                    </Badge>
                  </div>
                  <p className="mt-1.5 font-medium leading-snug">{session.caseTitle}</p>
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {new Date(session.fechaInicio).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/simulator/${session.caseId}?programacionId=${session.scheduleId}`}>
                  Ver simulación
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Aún no tienes simulaciones asignadas. Revisa tus cursos para comenzar.
          </p>
        )}
      </div>
      <Button asChild variant="link" className="mt-4 h-auto p-0">
        <Link href="/courses">Ir a mis cursos</Link>
      </Button>
    </Surface>
  );
}
