"use client";

import { useState } from "react";
import { Plus, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSection, Surface, SectionHeader } from "@/components/design-system";
import { ScheduleFormDialog } from "@/modules/academic/components/schedule-form-dialog";
import { useAssignments, useCases, useGroups, useSchedules } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ScheduleResponse } from "@/types/academic-admin";

export default function TeacherSimulationsPage() {
  const { data: groups } = useGroups();
  const { data: assignments } = useAssignments();
  const { data: schedulesPage } = useSchedules({ size: 100 });
  const { data: cases } = useCases({ size: 100, activo: true });
  const meta = getPageHeroMeta("/teacher/simulations");
  const schedules = schedulesPage?.content ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleResponse | null>(null);

  const caseTitleById = new Map(
    (cases ?? []).map((clinicalCase) => [Number(clinicalCase.id), clinicalCase.title])
  );

  const openCreate = () => {
    setEditingSchedule(null);
    setDialogOpen(true);
  };

  const openEdit = (schedule: ScheduleResponse) => {
    setEditingSchedule(schedule);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        action={
          <Button variant="brand" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Programar simulación
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {schedules.map((schedule) => (
            <Surface key={schedule.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    {schedule.casoId != null
                      ? caseTitleById.get(schedule.casoId) ?? `Caso ${schedule.casoId}`
                      : "Programación académica"}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(schedule.fechaInicio), "EEEE d MMM, HH:mm", { locale: es })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {schedule.grupoNombre}
                    {schedule.estudianteNombre ? ` · ${schedule.estudianteNombre}` : " · Curso completo"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={schedule.activo ? "outline" : "muted"}>
                    {schedule.activo ? "Programada" : "Cancelada"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(schedule)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Surface>
          ))}
        </div>

        <Surface>
          <SectionHeader title="Cursos disponibles" />
          <div className="mt-4 space-y-3">
            {groups?.map((group) => (
              <div key={group.id} className="rounded-lg border border-border/40 bg-muted/15 p-3">
                <p className="text-sm font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.studentsCount} estudiantes · {group.activeCases} simulaciones activas
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

      <ScheduleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        schedule={editingSchedule}
      />
    </div>
  );
}
