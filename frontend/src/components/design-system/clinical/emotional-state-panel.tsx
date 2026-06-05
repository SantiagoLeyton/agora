"use client";

import { motion } from "framer-motion";
import { Activity, Heart, Shield, Waves, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmotionalProfile } from "@/lib/simulator-clinical";
import { tokens } from "@/styles/tokens";

const metrics: {
  key: keyof EmotionalProfile;
  label: string;
  icon: typeof Activity;
  color: string;
  track: string;
}[] = [
  { key: "anxiety", label: "Ansiedad", icon: Waves, color: "text-warning", track: "bg-warning" },
  { key: "stability", label: "Estabilidad", icon: Heart, color: "text-success", track: "bg-success" },
  { key: "therapeuticAlliance", label: "Alianza terapéutica", icon: Shield, color: "text-primary", track: "bg-primary" },
  { key: "riskLevel", label: "Nivel de riesgo", icon: AlertTriangle, color: "text-brand", track: "bg-brand" },
  { key: "emotionalTension", label: "Tensión emocional", icon: Activity, color: "text-info", track: "bg-info" },
];

interface EmotionalStatePanelProps {
  profile: EmotionalProfile;
  compact?: boolean;
  className?: string;
}

export function EmotionalStatePanel({ profile, compact, className }: EmotionalStatePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: tokens.motion.base }}
      className={cn("ds-panel p-4", className)}
    >
      <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Activity className="h-3.5 w-3.5 text-primary" />
        Estado emocional del paciente
      </p>
      <div className={cn("space-y-3", compact && "space-y-2")}>
        {metrics.map((m, i) => {
          const Icon = m.icon;
          const value = profile[m.key];
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className={cn("flex items-center gap-1.5 font-medium", m.color)}>
                  <Icon className="h-3 w-3" />
                  {m.label}
                </span>
                <span className="tabular-nums text-muted-foreground">{value}%</span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-muted/60">
                <motion.div
                  className={cn("absolute inset-y-0 left-0 rounded-full opacity-90", m.track)}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: tokens.motion.easeOut }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
