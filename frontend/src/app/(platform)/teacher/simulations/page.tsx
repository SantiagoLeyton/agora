"use client";

import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSection, Surface, SectionHeader } from "@/components/design-system";
import { useAssignments, useGroups } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const scheduledSimulations = [
  { id: "s1", title: "Simulación de ansiedad — Grupo A", date: "2026-05-28T10:00:00", group: "Grupo A — TCC", status: "programada" },
  { id: "s2", title: "Protocolo de crisis — Grupo C", date: "2026-06-02T14:00:00", group: "Grupo C — Crisis", status: "programada" },
  { id: "s3", title: "Evaluación integradora — Grupo B", date: "2026-05-15T09:00:00", group: "Grupo B — Clínica", status: "completada" },
];

export default function TeacherSimulationsPage() {
  const { data: groups } = useGroups();
  const { data: assignments } = useAssignments();
  const meta = getPageHeroMeta("/teacher/simulations");

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        action={
          <Button variant="brand">
            <Plus className="h-4 w-4" />
            Programar simulación
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {scheduledSimulations.map((sim) => (
            <Surface key={sim.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{sim.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(sim.date), "EEEE d MMM, HH:mm", { locale: es })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{sim.group}</p>
                </div>
                <Badge variant={sim.status === "completada" ? "success" : "outline"}>
                  {sim.status === "completada" ? "Completada" : "Programada"}
                </Badge>
              </div>
            </Surface>
          ))}
        </div>

        <Surface>
          <SectionHeader title="Grupos disponibles" />
          <div className="mt-4 space-y-3">
            {groups?.map((g) => (
              <div key={g.id} className="rounded-lg border border-border/40 bg-muted/15 p-3">
                <p className="text-sm font-medium">{g.name}</p>
                <p className="text-xs text-muted-foreground">
                  {g.studentsCount} estudiantes · {g.activeCases} casos activos
                </p>
              </div>
            ))}
          </div>
          {assignments && assignments.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              {assignments.length} asignaciones vinculadas este semestre
            </p>
          )}
        </Surface>
      </div>
    </div>
  );
}
