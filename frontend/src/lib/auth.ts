import type { User, UserRole } from "@/types";

export const INSTITUTION_NAME = "Universidad Evangélica";

const MOCK_USERS: Record<string, Omit<User, "id"> & { password: string }> = {
  "estudiante@uni.edu": {
    email: "estudiante@uni.edu",
    name: "Ana Martínez",
    role: "student",
    institution: INSTITUTION_NAME,
    password: "password",
  },
  "docente@uni.edu": {
    email: "docente@uni.edu",
    name: "Dr. Carlos Mendoza",
    role: "teacher",
    institution: INSTITUTION_NAME,
    password: "password",
  },
  "admin@uni.edu": {
    email: "admin@uni.edu",
    name: "Laura Administradora",
    role: "admin",
    institution: INSTITUTION_NAME,
    password: "password",
  },
};

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

export function authenticateMockUser(
  email: string,
  password: string
): User | null {
  const normalized = email.trim().toLowerCase();
  const account = MOCK_USERS[normalized];
  if (!account || account.password !== password) return null;

  return {
    id: `usr-${account.role}`,
    email: account.email,
    name: account.name,
    role: account.role,
    institution: account.institution,
  };
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

export const DEMO_ACCOUNTS = Object.values(MOCK_USERS).map(
  ({ password: _, ...user }) => user
);
