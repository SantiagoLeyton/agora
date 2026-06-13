"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import {
  useActivateUser,
  useChangeUserPassword,
  useCreateUser,
  useDeactivateUser,
  useRoles,
  useUpdateUser,
} from "@/hooks/use-data";
import type { Role } from "@/types/auth";
import type { UserResponse } from "@/types/academic-admin";
import {
  formatApiValidationError,
  INSTITUTIONAL_PASSWORD_HINT,
  INSTITUTIONAL_PASSWORD_PATTERN,
} from "@/lib/user-session-cleanup";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserResponse | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEdit = Boolean(user);
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const changePassword = useChangeUserPassword();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<Role>("ESTUDIANTE");
  const [activo, setActivo] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (user) {
      setNombre(user.nombre);
      setApellido(user.apellido);
      setCorreo(user.correo);
      setRol(user.rol);
      setActivo(user.activo);
      setPassword("");
    } else {
      setNombre("");
      setApellido("");
      setCorreo("");
      setRol("ESTUDIANTE");
      setActivo(true);
      setPassword("");
    }
    setError("");
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isEdit && !INSTITUTIONAL_PASSWORD_PATTERN.test(password)) {
      setError(INSTITUTIONAL_PASSWORD_HINT);
      return;
    }
    if (isEdit && password.trim() && !INSTITUTIONAL_PASSWORD_PATTERN.test(password.trim())) {
      setError(INSTITUTIONAL_PASSWORD_HINT);
      return;
    }
    try {
      if (isEdit && user) {
        await updateUser.mutateAsync({
          id: user.id,
          request: { nombre, apellido, correo, rol, activo },
        });
        if (password.trim()) {
          await changePassword.mutateAsync({
            id: user.id,
            request: { password: password.trim() },
          });
        }
      } else {
        await createUser.mutateAsync({
          nombre,
          apellido,
          correo,
          rol,
          passwordTemporal: password,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(formatApiValidationError(err, "No se pudo guardar el usuario."));
    }
  };

  const toggleStatus = async () => {
    if (!user) return;
    try {
      if (user.activo) {
        await deactivateUser.mutateAsync(user.id);
      } else {
        await activateUser.mutateAsync(user.id);
      }
      onOpenChange(false);
    } catch (err) {
      setError(formatApiValidationError(err, "No se pudo actualizar el estado."));
    }
  };

  const saving =
    createUser.isPending ||
    updateUser.isPending ||
    changePassword.isPending ||
    activateUser.isPending ||
    deactivateUser.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar usuario" : "Nuevo usuario"}
      description="Gestión institucional de cuentas, roles y acceso a la plataforma."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="user-name">Nombre</Label>
            <Input id="user-name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-lastname">Apellido</Label>
            <Input id="user-lastname" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Correo</Label>
          <Input id="user-email" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-role">Rol</Label>
          <select
            id="user-role"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={rol}
            onChange={(e) => setRol(e.target.value as Role)}
          >
            {roles.map((item) => (
              <option key={item.id} value={item.nombre}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-password">
            {isEdit ? "Nueva contraseña (opcional)" : "Contraseña temporal"}
          </Label>
          <Input
            id="user-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">{INSTITUTIONAL_PASSWORD_HINT}</p>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            Usuario activo
          </label>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap justify-between gap-2">
          {isEdit && user && (
            <Button type="button" variant="outline" onClick={toggleStatus} disabled={saving}>
              {user.activo ? "Desactivar" : "Reactivar"}
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
