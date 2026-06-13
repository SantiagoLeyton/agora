import type { User, UserRole } from "@/types";

export const INSTITUTION_NAME = "CUE Alexander Von Humboldt";

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
  student: ["/dashboard", "/courses", "/simulator", "/evaluation"],
  teacher: ["/teacher", "/courses", "/simulator", "/evaluation"],
  admin: ["/admin", "/teacher", "/courses"],
};

export function isPathAllowedForRole(pathname: string, role: UserRole): boolean {
  if (pathname.startsWith("/simulator") && role !== "admin") return true;
  if (pathname.startsWith("/evaluation") && role !== "admin") return true;
  if (pathname.startsWith("/courses")) return true;

  const prefixes = ROLE_PREFIXES[role];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
