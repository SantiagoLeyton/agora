"use client";

import { ChevronDown, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClinicalLogEntry } from "@/lib/clinical-session-log";

interface ClinicalSessionLogProps {
  entries: ClinicalLogEntry[];
  className?: string;
  defaultOpen?: boolean;
}

export function ClinicalSessionLog({
  entries,
  className,
  defaultOpen = false,
}: ClinicalSessionLogProps) {
  if (entries.length === 0) return null;

  return (
    <details
      className={cn(
        "group rounded-lg border border-border/40 bg-muted/15",
        className
      )}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-1">
          <NotebookPen className="h-3 w-3 text-primary" />
          Bitácora automática
          <span className="font-normal normal-case text-foreground/70">
            ({entries.length})
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="max-h-[28vh] space-y-2 overflow-y-auto border-t border-border/30 px-2.5 py-2">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-md border border-border/30 bg-card/60 px-2 py-1.5 text-[10px]"
          >
            <p className="font-semibold text-primary">Intervención</p>
            <p className="mt-0.5 leading-snug text-foreground/90 line-clamp-3">
              {entry.intervention}
            </p>
            <p className="mt-1.5 font-semibold text-info">Respuesta</p>
            <p className="mt-0.5 leading-snug text-muted-foreground line-clamp-3">
              {entry.response}
            </p>
            {entry.impact.length > 0 && (
              <>
                <p className="mt-1.5 font-semibold text-muted-foreground">
                  Impacto
                </p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {entry.impact.map((line) => (
                    <span
                      key={line}
                      className="rounded border border-border/40 bg-muted/30 px-1 py-0.5 font-mono text-[9px] tabular-nums"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </details>
  );
}
