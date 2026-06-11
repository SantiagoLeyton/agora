"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils";
import { useSimulatorStore } from "@/store";
import { cn } from "@/lib/utils";
import { PatientPedagogyPanel } from "@/components/simulator/PatientPedagogyPanel";
import type { PatientPedagogyContent } from "@/lib/clinical-pedagogy";
import { ClinicalSessionLog } from "@/components/simulator/ClinicalSessionLog";
import { ClinicalSessionArtifacts } from "@/components/simulator/ClinicalSessionArtifacts";
import type { ClinicalLogEntry } from "@/lib/clinical-session-log";
import type {
  ClinicalSessionSummary,
  FormativeFeedbackSlot,
} from "@/types/clinical-session-artifacts";

interface ClinicalSessionSidebarProps {
  caseTitle: string;
  category?: string;
  progress: number;
  setting?: string;
  supportTools?: string[];
  patientPedagogy?: PatientPedagogyContent;
  sessionLog?: ClinicalLogEntry[];
  sessionSummary?: ClinicalSessionSummary | null;
  formativeFeedback?: FormativeFeedbackSlot | null;
  className?: string;
}

export function ClinicalSessionSidebar({
  caseTitle,
  category,
  progress,
  setting,
  supportTools,
  patientPedagogy,
  sessionLog,
  sessionSummary,
  formativeFeedback,
  className,
}: ClinicalSessionSidebarProps) {
  const { session, timerRunning, tickTimer } = useSimulatorStore();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  return (
    <aside
      className={cn(
        "flex min-h-0 min-w-0 flex-col border-r border-border/40 bg-card/50 px-3 py-3",
        className
      )}
    >
      <Button asChild variant="ghost" size="sm" className="-ml-1 mb-3 h-8 w-full justify-start gap-2 px-2">
        <Link href="/simulator">
          <ArrowLeft className="h-3.5 w-3.5" />
          Expedientes
        </Link>
      </Button>

      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Sesión activa
      </p>
      <h2 className="mt-1 line-clamp-3 font-display text-sm font-semibold leading-snug">
        {caseTitle}
      </h2>
      {category && (
        <p className="mt-2 text-[11px] text-muted-foreground">{category}</p>
      )}

      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span className="tabular-nums font-medium text-foreground">
          {formatDuration(session?.elapsedSeconds ?? 0)}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
          <span>Progreso</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {setting && (
        <p className="mt-4 line-clamp-4 text-[11px] leading-relaxed text-muted-foreground">
          {setting}
        </p>
      )}

      {sessionLog && sessionLog.length > 0 && (
        <ClinicalSessionLog entries={sessionLog} className="mt-4 shrink-0" />
      )}

      {(sessionSummary || formativeFeedback) && (
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          <ClinicalSessionArtifacts
            summary={sessionSummary}
            formativeFeedback={formativeFeedback}
          />
        </div>
      )}

      {patientPedagogy && (
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-border/30 pt-3">
          <PatientPedagogyPanel content={patientPedagogy} compact />
        </div>
      )}

      {supportTools && supportTools.length > 0 && (
        <div className={cn("mt-4", patientPedagogy && "shrink-0")}>
          <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            Recursos
          </p>
          <ul className="space-y-1">
            {supportTools.map((tool) => (
              <li
                key={tool}
                className="rounded-md border border-border/40 bg-muted/20 px-2 py-1 text-[10px] text-foreground/90"
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
