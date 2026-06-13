"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { useJoinGroup } from "@/hooks/use-data";
import { ApiError } from "@/services/api-error";

interface CourseEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CourseEnrollDialog({ open, onOpenChange, onSuccess }: CourseEnrollDialogProps) {
  const joinGroup = useJoinGroup();
  const [claveAcceso, setClaveAcceso] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await joinGroup.mutateAsync({ claveAcceso: claveAcceso.trim() });
      setClaveAcceso("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo ingresar al curso.");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ingresar con clave"
      description="Introduce la clave del curso para matricularte o asignarte como docente."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-key">Clave de acceso</Label>
          <Input
            id="course-key"
            value={claveAcceso}
            onChange={(event) => setClaveAcceso(event.target.value.toUpperCase())}
            placeholder="PSOC-I-2026"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={joinGroup.isPending}>
            <KeyRound className="h-4 w-4" />
            {joinGroup.isPending ? "Validando..." : "Ingresar al curso"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
