import type { Role } from "@/types/auth";
import type { PageRequest } from "@/types/page";

type QueryValue = string | number | boolean | undefined | null;

export interface UserResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Role;
  activo: boolean;
  ultimoAcceso?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateUserRequest {
  nombre: string;
  apellido: string;
  correo: string;
  passwordTemporal: string;
  rol: Role;
}

export interface UpdateUserRequest {
  nombre: string;
  apellido: string;
  correo: string;
  rol: Role;
  activo: boolean;
}

export interface ChangePasswordRequest {
  password: string;
}

export interface UserFilters extends PageRequest {
  [key: string]: QueryValue;
  rol?: Role;
  activo?: boolean;
  search?: string;
}

export interface RoleResponse {
  id: number;
  nombre: Role;
  descripcion: string | null;
  activo: boolean;
}

export interface GroupResponse {
  id: number;
  docenteId: number;
  docenteCorreo: string;
  docenteIds: number[];
  docentesAsignados: number;
  cupoDocentesDisponible: number;
  nombre: string;
  descripcion: string | null;
  periodo: string;
  claveAcceso: string | null;
  activo: boolean;
  inscrito: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateGroupRequest {
  nombre: string;
  descripcion?: string | null;
  periodo: string;
  claveAcceso?: string | null;
  docenteId?: number | null;
}

export interface UpdateGroupRequest {
  nombre: string;
  descripcion?: string | null;
  periodo: string;
  claveAcceso?: string | null;
  docenteId?: number | null;
}

export interface GroupFilters extends PageRequest {
  [key: string]: QueryValue;
  periodo?: string;
  activo?: boolean;
  search?: string;
  scope?: "mis" | "explorar";
}

export interface JoinGroupRequest {
  claveAcceso: string;
}

export interface BatchGroupStudentsRequest {
  estudianteIds: number[];
}

export interface BatchGroupStudentFailure {
  estudianteId: number;
  motivo: string;
}

export interface BatchGroupStudentsResponse {
  agregados: GroupStudentResponse[];
  removidos: number[];
  fallidos: BatchGroupStudentFailure[];
}

export interface GroupTeacherResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  titular: boolean;
  fechaAsignacion: string;
}

export interface AddGroupTeacherRequest {
  docenteId: number;
}

export interface GroupStudentResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  fechaIngreso: string;
}

export interface AddGroupStudentRequest {
  estudianteId: number;
}

export interface ScheduleResponse {
  id: number;
  grupoId: number;
  grupoNombre: string;
  docenteId: number;
  docenteCorreo: string;
  casoId: number | null;
  estudianteId: number | null;
  estudianteNombre: string | null;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface CreateScheduleRequest {
  grupoId: number;
  casoId?: number | null;
  estudianteId?: number | null;
  fechaInicio: string;
  fechaFin: string;
}

export interface UpdateScheduleRequest {
  grupoId: number;
  casoId?: number | null;
  estudianteId?: number | null;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface ScheduleFilters extends PageRequest {
  [key: string]: QueryValue;
  grupoId?: number;
  activo?: boolean;
  desde?: string;
  hasta?: string;
}
