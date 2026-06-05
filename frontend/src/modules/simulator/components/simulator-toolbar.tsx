"use client";

import { useEffect } from "react";
import { Pause, Play, Clock, ListChecks, BookOpen, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { useSimulatorStore } from "@/store";
import { clinicalCopy } from "@/lib/clinical-copy";

interface SimulatorToolbarProps {
  caseTitle: string;
  progress: number;
  supportTools?: string[];
}

export function SimulatorToolbar({ caseTitle, progress, supportTools }: SimulatorToolbarProps) {
  const { session, timerRunning, pauseTimer, resumeTimer, tickTimer } = useSimulatorStore();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  return (
    <div className="flex flex-col gap-3 border-b border-border/40 bg-card/90 px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between md:px-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <p className="truncate text-sm font-semibold">{caseTitle}</p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={progress} className="h-1.5 max-w-[220px] flex-1" />
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {clinicalCopy.progress}: {progress}%
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {supportTools && supportTools.length > 0 && (
          <div className="hidden items-center gap-2 md:flex">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            {supportTools.slice(0, 2).map((tool) => (
              <Badge
                key={tool}
                variant="outline"
                className="border-primary/10 bg-primary/[0.04] text-[10px] shadow-[0_0_12px_-6px_hsl(var(--primary)/0.2)]"
              >
                {tool}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/40 px-3 py-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-sm tabular-nums">
            {formatDuration(session?.elapsedSeconds ?? 0)}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={timerRunning ? pauseTimer : resumeTimer}>
            {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/40 px-3 py-1.5">
          <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs">
            {session?.decisions.length ?? 0} {clinicalCopy.decisions.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
