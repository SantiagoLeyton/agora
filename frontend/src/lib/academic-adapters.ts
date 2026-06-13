import type {
  GroupResponse,
  GroupStudentResponse,
  ScheduleResponse,
  UserResponse,
} from "@/types/academic-admin";
import type { Assignment, Group, Student, UserRole } from "@/types";

const PENDING_PROGRESS_FALLBACK = 0;
const PENDING_CASES_COMPLETED_FALLBACK = 0;
const PENDING_COMPLETION_RATE_FALLBACK = 0;
const PENDING_AVERAGE_PROGRESS_FALLBACK = 0;

export function academicRoleToUserRole(role: UserResponse["rol"]): UserRole {
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

export function fullName(nombre: string, apellido: string): string {
  return `${nombre} ${apellido}`.trim();
}

export function mapGroupStudentToStudent(
  student: GroupStudentResponse,
  groupName: string,
  groupId: number
): Student {
  return {
    id: `${groupId}-${student.id}`,
    name: fullName(student.nombre, student.apellido),
    email: student.correo,
    group: groupName,
    progress: PENDING_PROGRESS_FALLBACK,
    casesCompleted: PENDING_CASES_COMPLETED_FALLBACK,
    lastActivity: student.fechaIngreso,
    status: "active",
  };
}

export function mapGroupToUiGroup(
  group: GroupResponse,
  studentsCount: number,
  activeCases: number
): Group {
  return {
    id: String(group.id),
    name: group.nombre,
    description: group.descripcion,
    studentsCount,
    activeCases,
    averageProgress: PENDING_AVERAGE_PROGRESS_FALLBACK,
    semester: group.periodo,
    active: group.activo,
    teacherId: group.docenteId,
    accessKey: group.claveAcceso,
    enrolled: group.inscrito,
    docentesAsignados: group.docentesAsignados,
    cupoDocentesDisponible: group.cupoDocentesDisponible,
  };
}

export function mapScheduleToAssignment(schedule: ScheduleResponse): Assignment {
  const caseLabel =
    schedule.casoId === null ? "Caso sin asignar" : `Caso ${schedule.casoId}`;

  return {
    id: String(schedule.id),
    title: `Programacion ${schedule.id}`,
    caseId: schedule.casoId === null ? "" : String(schedule.casoId),
    caseTitle: caseLabel,
    groupId: String(schedule.grupoId),
    groupName: schedule.grupoNombre,
    dueDate: schedule.fechaFin,
    completionRate: PENDING_COMPLETION_RATE_FALLBACK,
  };
}
