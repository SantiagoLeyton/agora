import type { User, UserRole } from "@/types";

export const INSTITUTION_NAME = "Universidad Evangelica";

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "/teacher";
    case "admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "Docente";
    case "admin":
      return "Administrador";
    default:
      return "Estudiante";
  }
}

const ROLE_PREFIXES: Record<UserRole, string[]> = {
  student: ["/dashboard", "/simulator", "/evaluation"],
  teacher: ["/teacher", "/simulator", "/evaluation"],
  admin: ["/admin", "/teacher"],
};

export function isPathAllowedForRole(pathname: string, role: UserRole): boolean {
  if (pathname.startsWith("/simulator") && role !== "admin") return true;
  if (pathname.startsWith("/evaluation") && role !== "admin") return true;

  const prefixes = ROLE_PREFIXES[role];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
