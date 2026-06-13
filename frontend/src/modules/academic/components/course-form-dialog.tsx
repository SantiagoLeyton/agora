"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { useCreateGroup, useUpdateGroup, useUsers } from "@/hooks/use-data";
import type { GroupResponse } from "@/types/academic-admin";
import { ApiError } from "@/services/api-error";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: GroupResponse | null;
  isAdmin?: boolean;
}

export function CourseFormDialog({ open, onOpenChange, course, isAdmin }: CourseFormDialogProps) {
  const isEdit = Boolean(course);
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const { data: teachersPage } = useUsers({ rol: "DOCENTE", activo: true, size: 100 });
  const { data: teacherAdminsPage } = useUsers({ rol: "DOCENTE_ADMIN", activo: true, size: 100 });
  const teachers = [...(teachersPage?.content ?? []), ...(teacherAdminsPage?.content ?? [])];

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [claveAcceso, setClaveAcceso] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (course) {
      setNombre(course.nombre);
      setDescripcion(course.descripcion ?? "");
      setPeriodo(course.periodo);
      setClaveAcceso(course.claveAcceso ?? "");
      setDocenteId(String(course.docenteId));
    } else {
      setNombre("");
      setDescripcion("");
      setPeriodo("");
      setClaveAcceso("");
      setDocenteId("");
    }
    setError("");
  }, [open, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      nombre,
      descripcion: descripcion || null,
      periodo,
      claveAcceso: claveAcceso.trim() || null,
      docenteId: isAdmin && docenteId ? Number(docenteId) : null,
    };

    try {
      if (isEdit && course) {
        await updateGroup.mutateAsync({ id: course.id, request: payload });
      } else {
        await createGroup.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el curso.");
    }
  };

  const saving = createGroup.isPending || updateGroup.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar curso" : "Nuevo curso"}
      description="Los cursos agrupan estudiantes y programaciones académicas."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-name">Nombre</Label>
          <Input id="course-name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-period">Periodo</Label>
          <Input id="course-period" value={periodo} onChange={(e) => setPeriodo(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-description">Descripción</Label>
          <Input id="course-description" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-key">Clave de acceso</Label>
          <Input
            id="course-key"
            value={claveAcceso}
            onChange={(e) => setClaveAcceso(e.target.value.toUpperCase())}
            placeholder="PSOC-I-2026"
          />
          <p className="text-xs text-muted-foreground">
            Los estudiantes y docentes usan esta clave una sola vez para ingresar al curso.
          </p>
        </div>
        {isAdmin && (
          <div className="space-y-2">
            <Label htmlFor="course-teacher">Docente asignado</Label>
            <select
              id="course-teacher"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={docenteId}
              onChange={(e) => setDocenteId(e.target.value)}
              required
            >
              <option value="">Seleccionar docente</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nombre} {teacher.apellido} · {teacher.correo}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
