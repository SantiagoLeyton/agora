"use client";

import { Brain, Shield, Users } from "lucide-react";
import { HeroSection, SectionHeader, ClinicalCaseGrid, Surface } from "@/components/design-system";
import { useCases } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function SimulatorPage() {
  const { data: cases, isLoading } = useCases();
  const meta = getPageHeroMeta("/simulator");

  const inProgress = cases?.filter((c) => c.status === "in_progress").length ?? 0;
  const completed = cases?.filter((c) => c.status === "completed").length ?? 0;

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        tags={["Práctica segura", "Narrativa clínica"]}
        stats={[
          { label: "Casos", value: cases?.length ?? 0 },
          { label: "En curso", value: inProgress },
          { label: "Completados", value: completed },
        ]}
        aside={
          <div className="grid gap-3 text-sm">
            {[
              { icon: Shield, label: "Entorno seguro", desc: "Práctica sin riesgo real" },
              { icon: Users, label: "Narrativa interactiva", desc: "Decisiones clínicas" },
              { icon: Brain, label: "Evaluación formativa", desc: "Competencias" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-2.5 rounded-lg border border-border/40 bg-background/50 p-2.5">
                <Icon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-xs">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        }
      />

      <SectionHeader
        title="Repositorio de expedientes clínicos"
        description={`${cases?.length ?? 0} expedientes · ${inProgress} en curso · ${completed} completados`}
      />

      {isLoading ? (
        <Surface variant="muted" className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </Surface>
      ) : cases && cases.length > 0 ? (
        <ClinicalCaseGrid cases={cases} />
      ) : (
        <Surface variant="muted" className="py-16 text-center text-muted-foreground">
          No hay casos disponibles
        </Surface>
      )}
    </div>
  );
}
