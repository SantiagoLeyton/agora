"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DialogueOption } from "@/types";
import { Search, ClipboardList, Heart, LogOut, Target } from "lucide-react";
import { clinicalCopy } from "@/lib/clinical-copy";
import { tokens } from "@/styles/tokens";
import { PatientPedagogyPanel } from "@/components/simulator/PatientPedagogyPanel";
import type { PatientPedagogyContent } from "@/lib/clinical-pedagogy";
import { ClinicalSessionLog } from "@/components/simulator/ClinicalSessionLog";
import type { ClinicalLogEntry } from "@/lib/clinical-session-log";

const categoryConfig = {
  explore: {
    icon: Search,
    label: "Exploración",
    objective: "Profundizar en la experiencia subjetiva y emocional del paciente.",
    color:
      "hover:border-info/35 hover:bg-info/[0.06] hover:shadow-[0_0_20px_-8px_hsl(var(--info)/0.3)]",
  },
  assess: {
    icon: ClipboardList,
    label: "Evaluación",
    objective: "Recopilar información clínica para la formulación del caso.",
    color:
      "hover:border-primary/35 hover:bg-primary/[0.06] hover:shadow-[var(--shadow-glow-primary)]",
  },
  intervene: {
    icon: Heart,
    label: "Intervención",
    objective: "Aplicar una técnica terapéutica acorde al momento de la sesión.",
    color: "hover:border-success/35 hover:bg-success/[0.06]",
  },
  close: {
    icon: LogOut,
    label: "Cierre",
    objective: "Orientar el cierre o la continuidad del proceso terapéutico.",
    color: "hover:border-muted-foreground/30 hover:bg-muted/40",
  },
};

interface DecisionPanelProps {
  options: DialogueOption[];
  onSelect: (option: DialogueOption) => void;
  disabled?: boolean;
  patientPedagogy?: PatientPedagogyContent;
  sessionLog?: ClinicalLogEntry[];
}

export function DecisionPanel({
  options,
  onSelect,
  disabled,
  patientPedagogy,
  sessionLog,
}: DecisionPanelProps) {
  if (options.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: tokens.motion.easeOut }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {sessionLog && sessionLog.length > 0 && (
        <ClinicalSessionLog entries={sessionLog} className="mb-3 shrink-0 lg:hidden" />
      )}

      {patientPedagogy && (
        <div className="mb-4 max-h-[32vh] shrink-0 overflow-y-auto border-b border-border/40 pb-4 lg:hidden">
          <PatientPedagogyPanel content={patientPedagogy} compact />
        </div>
      )}

      <div className="mb-4 shrink-0">
        <p className="font-display text-sm font-semibold text-foreground">
          Intervenciones clínicas
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Cada opción se registrará como tu intervención y activará la respuesta
          del paciente.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {options.map((option, index) => {
          const cat = option.category ? categoryConfig[option.category] : null;
          const Icon = cat?.icon;

          return (
            <motion.button
              key={option.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.995 }}
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={cn(
                "w-full rounded-xl border border-border/60 bg-card/80 p-4 text-left",
                "transition-[border-color,background-color,box-shadow] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                cat?.color ?? "hover:border-primary/25 hover:bg-primary/[0.03]"
              )}
            >
              <div className="flex gap-3">
                {Icon && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                  {cat && (
                    <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-2">
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Objetivo clínico
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-foreground/90">
                        {cat.objective}
                      </p>
                      <span className="mt-2 inline-block text-[10px] font-medium text-primary/80">
                        {cat.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 shrink-0 text-center text-[10px] text-muted-foreground">
        {options.length} {clinicalCopy.decisions.toLowerCase()} disponibles
      </p>
    </motion.div>
  );
}
