"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils";
import { useSimulatorStore } from "@/store";
import { cn } from "@/lib/utils";

interface ClinicalSessionHeaderProps {
  caseTitle: string;
  category?: string;
  progress: number;
  isComplete?: boolean;
  className?: string;
}

export function ClinicalSessionHeader({
  caseTitle,
  category,
  progress,
  isComplete,
  className,
}: ClinicalSessionHeaderProps) {
  const { session, timerRunning, pauseTimer, resumeTimer, tickTimer } =
    useSimulatorStore();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  return (
    <header
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-3 border-b border-border/40 bg-card/80 px-4 py-2.5 backdrop-blur-md md:px-5",
        className
      )}
    >
      <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
        <Link href="/simulator" aria-label="Volver al repositorio">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate font-display text-sm font-semibold md:text-base">
            {caseTitle}
          </h1>
          {category && (
            <span className="hidden rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
              {category}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <Progress value={progress} className="h-1 max-w-[200px] flex-1" />
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {progress}%
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              isComplete
                ? "bg-success/15 text-success"
                : "bg-primary/10 text-primary"
            )}
          >
            {isComplete ? "Sesión finalizada" : "Sesión en curso"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="tabular-nums font-medium">
          {formatDuration(session?.elapsedSeconds ?? 0)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={timerRunning ? pauseTimer : resumeTimer}
        >
          {timerRunning ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
      </div>
    </header>
  );
}
