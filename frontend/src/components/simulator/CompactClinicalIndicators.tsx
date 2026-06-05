"use client";

import { Shield, Heart, Waves, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmotionalProfile } from "@/lib/simulator-clinical";

const INDICATORS: {
  key: keyof Pick<
    EmotionalProfile,
    "anxiety" | "therapeuticAlliance" | "riskLevel"
  >;
  label: string;
  icon: typeof Waves;
  tone: string;
  bar: string;
}[] = [
  {
    key: "anxiety",
    label: "Ansiedad",
    icon: Waves,
    tone: "text-warning",
    bar: "bg-warning",
  },
  {
    key: "therapeuticAlliance",
    label: "Alianza",
    icon: Shield,
    tone: "text-primary",
    bar: "bg-primary",
  },
  {
    key: "riskLevel",
    label: "Riesgo",
    icon: AlertTriangle,
    tone: "text-destructive",
    bar: "bg-destructive",
  },
];

/** Confianza derivada de alianza e inversa de ansiedad (apoyo pedagógico, sin nueva API). */
function confidenceScore(profile: EmotionalProfile): number {
  return Math.round(
    Math.min(
      100,
      Math.max(
        0,
        profile.therapeuticAlliance * 0.65 +
          (100 - profile.anxiety) * 0.25 +
          profile.stability * 0.1
      )
    )
  );
}

interface CompactClinicalIndicatorsProps {
  profile: EmotionalProfile;
  className?: string;
}

export function CompactClinicalIndicators({
  profile,
  className,
}: CompactClinicalIndicatorsProps) {
  const confidence = confidenceScore(profile);

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card/60 p-3", className)}>
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Indicadores de apoyo
      </p>
      <div className="space-y-2.5">
        {INDICATORS.map((m) => {
          const Icon = m.icon;
          const value = profile[m.key];
          return (
            <div key={m.key}>
              <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
                <span className={cn("flex items-center gap-1 font-medium", m.tone)}>
                  <Icon className="h-3 w-3 shrink-0" />
                  {m.label}
                </span>
                <span className="tabular-nums text-muted-foreground">{value}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", m.bar)}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
        <div>
          <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1 font-medium text-success">
              <Heart className="h-3 w-3 shrink-0" />
              Confianza
            </span>
            <span className="tabular-nums text-muted-foreground">{confidence}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
