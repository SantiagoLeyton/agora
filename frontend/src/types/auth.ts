import type { User, UserRole } from "@/types";

export type Role = "ESTUDIANTE" | "DOCENTE" | "DOCENTE_ADMIN" | "ADMINISTRADOR";

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  usuario: AuthenticatedUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

export function mapBackendRoleToUserRole(role: Role): UserRole {
  switch (role) {
    case "DOCENTE":
    case "DOCENTE_ADMIN":
      return "teacher";
    case "ADMINISTRADOR":
      return "admin";
    default:
      return "student";
  }
}

export function mapAuthenticatedUserToUser(user: AuthenticatedUser): User {
  const fullName = `${user.nombre} ${user.apellido}`.trim();

  return {
    id: String(user.id),
    email: user.correo,
    name: fullName.length > 0 ? fullName : user.correo,
    role: mapBackendRoleToUserRole(user.rol),
    backendRole: user.rol,
  };
}
