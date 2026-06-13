"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection, PageLoading, Surface } from "@/components/design-system";
import { ScheduleFormDialog } from "@/modules/academic/components/schedule-form-dialog";
import {
  useAcademicGroup,
  useBatchAddGroupStudents,
  useBatchRemoveGroupStudents,
  useGroupStudents,
  useSchedules,
  useStudents,
} from "@/hooks/use-data";
import { fullName } from "@/lib/academic-adapters";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CourseDetailViewProps {
  courseId: number;
  backHref: string;
}

export function CourseDetailView({ courseId, backHref }: CourseDetailViewProps) {
  const { data: course, isLoading } = useAcademicGroup(courseId);
  const { data: students = [] } = useGroupStudents(courseId);
  const { data: allStudents = [] } = useStudents();
  const { data: schedulesPage } = useSchedules({ grupoId: courseId, size: 100 });
  const addBatch = useBatchAddGroupStudents(courseId);
  const removeBatch = useBatchRemoveGroupStudents(courseId);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<number[]>([]);
  const [batchMessage, setBatchMessage] = useState("");

  const enrolledIds = useMemo(() => new Set(students.map((student) => student.id)), [students]);
  const availableStudents = useMemo(
    () =>
      allStudents.filter((student) => {
        const studentId = Number(student.id.split("-").pop());
        return Number.isFinite(studentId) && !enrolledIds.has(studentId);
      }),
    [allStudents, enrolledIds]
  );

  if (isLoading || !course) {
    return <PageLoading />;
  }

  const toggleSelection = (list: number[], id: number, checked: boolean) => {
    if (checked) return [...list, id];
    return list.filter((value) => value !== id);
  };

  const handleAddBatch = async () => {
    if (selectedToAdd.length === 0) return;
    setBatchMessage("");
    const result = await addBatch.mutateAsync({ estudianteIds: selectedToAdd });
    setSelectedToAdd([]);
    setBatchMessage(
      `Agregados: ${result.agregados.length}. Fallidos: ${result.fallidos.length}.`
    );
  };

  const handleRemoveBatch = async () => {
    if (selectedToRemove.length === 0) return;
    setBatchMessage("");
    const result = await removeBatch.mutateAsync({ estudianteIds: selectedToRemove });
    setSelectedToRemove([]);
    setBatchMessage(
      `Removidos: ${result.removidos.length}. Fallidos: ${result.fallidos.length}.`
    );
  };

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>
      </Button>

      <HeroSection
        eyebrow="Curso"
        title={course.nombre}
        description={course.descripcion ?? `Periodo ${course.periodo}`}
        action={
          <Button variant="brand" onClick={() => setScheduleOpen(true)}>
            <Plus className="h-4 w-4" />
            Programar simulación
          </Button>
        }
      />

      {course.claveAcceso && (
        <Surface variant="muted" className="text-sm">
          Clave de acceso: <span className="font-mono font-medium">{course.claveAcceso}</span>
          {" · "}
          Docentes asignados: {course.docentesAsignados}/2
        </Surface>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <h2 className="font-medium">Estudiantes matriculados</h2>
          <div className="mt-4 space-y-2">
            {students.map((student) => (
              <label
                key={student.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedToRemove.includes(student.id)}
                    onChange={(event) =>
                      setSelectedToRemove((current) =>
                        toggleSelection(current, student.id, event.target.checked)
                      )
                    }
                  />
                  <div>
                    <p className="font-medium">{fullName(student.nombre, student.apellido)}</p>
                    <p className="text-muted-foreground">{student.correo}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <Button
            className="mt-4"
            variant="outline"
            disabled={selectedToRemove.length === 0 || removeBatch.isPending}
            onClick={handleRemoveBatch}
          >
            <UserMinus className="h-4 w-4" />
            Remover seleccionados
          </Button>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium">Agregar estudiantes en bloque</h3>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {availableStudents.map((student) => {
                const studentId = Number(student.id.split("-").pop());
                return (
                  <label key={student.id} className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedToAdd.includes(studentId)}
                      onChange={(event) =>
                        setSelectedToAdd((current) =>
                          toggleSelection(current, studentId, event.target.checked)
                        )
                      }
                    />
                    <span>{student.name}</span>
                  </label>
                );
              })}
            </div>
            <Button
              className="mt-4"
              disabled={selectedToAdd.length === 0 || addBatch.isPending}
              onClick={handleAddBatch}
            >
              <UserPlus className="h-4 w-4" />
              Agregar seleccionados
            </Button>
          </div>
          {batchMessage && <p className="mt-3 text-sm text-muted-foreground">{batchMessage}</p>}
        </Surface>

        <Surface>
          <h2 className="font-medium">Simulaciones programadas</h2>
          <div className="mt-4 space-y-3">
            {(schedulesPage?.content ?? []).map((schedule) => (
              <div key={schedule.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">
                  {schedule.casoId ? `Caso #${schedule.casoId}` : "Sin caso asignado"}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(schedule.fechaInicio), "d MMM yyyy", { locale: es })} –{" "}
                  {format(new Date(schedule.fechaFin), "d MMM yyyy", { locale: es })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {schedule.estudianteId ? "Individual" : "Curso completo"} ·{" "}
                  {schedule.activo ? "Activa" : "Inactiva"}
                </p>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <ScheduleFormDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        defaultGrupoId={courseId}
      />
    </div>
  );
}
