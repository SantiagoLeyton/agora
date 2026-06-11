"use client";

import { motion } from "framer-motion";
import { GitBranch, Sparkles, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/simulator-clinical";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClinicalTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const typeIcon = {
  decision: GitBranch,
  milestone: Sparkles,
  shift: Circle,
};

export function ClinicalTimeline({ events, className }: ClinicalTimelineProps) {
  if (events.length === 0) return null;

  return (
    <div className={cn("ds-panel p-4", className)}>
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Línea temporal clínica
      </p>
      <div className="relative space-y-0 pl-1">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-primary/30 via-border to-transparent" />
        {events.map((event, i) => {
          const Icon = typeIcon[event.type];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              <div
                className={cn(
                  "relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-card",
                  event.type === "shift" ? "bg-info/20 text-info" : "bg-primary/15 text-primary"
                )}
              >
                <Icon className="h-2 w-2" />
              </div>
              <div className="min-w-0 flex-1 pt-0">
                <p className="text-xs font-medium leading-snug text-foreground">{event.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{event.description}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/80">
                  {format(new Date(event.timestamp), "HH:mm", { locale: es })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
