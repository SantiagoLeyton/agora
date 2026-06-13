"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/design-system";
import { useActivateCase, useDeactivateCase, useDeleteCase } from "@/hooks/use-data";
import { ApiError } from "@/services/api-error";

interface CaseLifecycleActionsProps {
  caseId: string;
  title: string;
  isActive: boolean;
}

export function CaseLifecycleActions({ caseId, title, isActive }: CaseLifecycleActionsProps) {
  const router = useRouter();
  const activateCase = useActivateCase();
  const deactivateCase = useDeactivateCase();
  const deleteCase = useDeleteCase();
  const [message, setMessage] = useState("");

  const numericId = Number(caseId);
  const busy = activateCase.isPending || deactivateCase.isPending || deleteCase.isPending;

  const handleActivate = async () => {
    setMessage("");
    try {
      await activateCase.mutateAsync(numericId);
      setMessage("Caso activado correctamente.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "No se pudo activar el caso.");
    }
  };

  const handleDeactivate = async () => {
    setMessage("");
    try {
      await deactivateCase.mutateAsync(numericId);
      setMessage("Caso desactivado correctamente.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "No se pudo desactivar el caso.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar permanentemente el caso "${title}"?`)) return;
    setMessage("");
    try {
      await deleteCase.mutateAsync(numericId);
      router.push("/teacher/cases");
    } catch (err) {
      setMessage(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el caso. Si tiene intentos o programaciones, desactívalo."
      );
    }
  };

  return (
    <Surface className="space-y-3">
      <p className="text-sm font-medium">Estado del expediente</p>
      <p className="text-sm text-muted-foreground">
        Estado actual: <strong>{isActive ? "Activo" : "Inactivo"}</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {isActive ? (
          <Button type="button" variant="outline" size="sm" onClick={handleDeactivate} disabled={busy}>
            <PowerOff className="h-4 w-4" />
            Desactivar caso
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={handleActivate} disabled={busy}>
            <Power className="h-4 w-4" />
            Activar caso
          </Button>
        )}
        <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={busy}>
          <Trash2 className="h-4 w-4" />
          Eliminar caso
        </Button>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </Surface>
  );
}
