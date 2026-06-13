"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import {
  useCases,
  useCreateSchedule,
  useGroupStudents,
  useGroups,
  useUpdateSchedule,
} from "@/hooks/use-data";
import type { ScheduleResponse } from "@/types/academic-admin";
import { ApiError } from "@/services/api-error";

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: ScheduleResponse | null;
  defaultGrupoId?: number;
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  defaultGrupoId,
}: ScheduleFormDialogProps) {
  const isEdit = Boolean(schedule);
  const { data: groups } = useGroups({ size: 100, activo: true });
  const { data: cases } = useCases({ activo: true, size: 100 });
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();

  const [grupoId, setGrupoId] = useState("");
  const [casoId, setCasoId] = useState("");
  const [scope, setScope] = useState<"course" | "student">("course");
  const [estudianteId, setEstudianteId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState("");

  const groupIdNum = Number(grupoId);
  const { data: students } = useGroupStudents(Number.isFinite(groupIdNum) ? groupIdNum : 0);

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      setGrupoId(String(schedule.grupoId));
      setCasoId(schedule.casoId != null ? String(schedule.casoId) : "");
      setScope(schedule.estudianteId ? "student" : "course");
      setEstudianteId(schedule.estudianteId != null ? String(schedule.estudianteId) : "");
      setFechaInicio(toLocalInput(schedule.fechaInicio));
      setFechaFin(toLocalInput(schedule.fechaFin));
      setActivo(schedule.activo);
    } else {
      setGrupoId(defaultGrupoId ? String(defaultGrupoId) : "");
      setCasoId("");
      setScope("course");
      setEstudianteId("");
      setFechaInicio("");
      setFechaFin("");
      setActivo(true);
    }
    setError("");
  }, [open, schedule, defaultGrupoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!grupoId || !fechaInicio || !fechaFin) {
      setError("Completa curso y fechas de la programación.");
      return;
    }

    const payload = {
      grupoId: Number(grupoId),
      casoId: casoId ? Number(casoId) : null,
      estudianteId: scope === "student" && estudianteId ? Number(estudianteId) : null,
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin: new Date(fechaFin).toISOString(),
    };

    try {
      if (isEdit && schedule) {
        await updateSchedule.mutateAsync({
          id: schedule.id,
          request: { ...payload, activo },
        });
      } else {
        await createSchedule.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la programación.");
    }
  };

  const saving = createSchedule.isPending || updateSchedule.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar programación" : "Programar simulación"}
      description="Asigna un caso clínico a un curso completo o a un estudiante individual."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-group">Curso</Label>
          <select
            id="schedule-group"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={grupoId}
            onChange={(e) => {
              setGrupoId(e.target.value);
              setEstudianteId("");
            }}
            required
          >
            <option value="">Seleccionar curso</option>
            {groups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} · {group.semester}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule-case">Caso clínico</Label>
          <select
            id="schedule-case"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={casoId}
            onChange={(e) => setCasoId(e.target.value)}
          >
            <option value="">Sin caso específico</option>
            {cases?.map((clinicalCase) => (
              <option key={clinicalCase.id} value={clinicalCase.id}>
                {clinicalCase.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Alcance</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={scope === "course" ? "default" : "outline"}
              onClick={() => setScope("course")}
            >
              Curso completo
            </Button>
            <Button
              type="button"
              size="sm"
              variant={scope === "student" ? "default" : "outline"}
              onClick={() => setScope("student")}
            >
              Estudiante individual
            </Button>
          </div>
        </div>

        {scope === "student" && (
          <div className="space-y-2">
            <Label htmlFor="schedule-student">Estudiante</Label>
            <select
              id="schedule-student"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={estudianteId}
              onChange={(e) => setEstudianteId(e.target.value)}
              required
            >
              <option value="">Seleccionar estudiante</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nombre} {student.apellido}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schedule-start">Inicio</Label>
            <Input
              id="schedule-start"
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-end">Fin</Label>
            <Input
              id="schedule-end"
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
            />
            Programación activa
          </label>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Programar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
