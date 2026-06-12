import type { Role } from "@/types/auth";

export function canManageClinicalCases(role?: Role | null): boolean {
  return role === "ADMINISTRADOR" || role === "DOCENTE_ADMIN";
}

export function canViewClinicalRepository(role?: Role | null): boolean {
  return (
    role === "ADMINISTRADOR" ||
    role === "DOCENTE_ADMIN" ||
    role === "DOCENTE" ||
    role === "ESTUDIANTE"
  );
}
