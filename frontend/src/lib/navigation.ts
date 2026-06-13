import type { NavItem, UserRole } from "@/types";
import { clinicalCopy } from "@/lib/clinical-copy";

const studentNav: NavItem[] = [
  { title: "Inicio", href: "/dashboard", icon: "LayoutDashboard", roles: ["student"], section: "Aprendizaje" },
  { title: "Cursos", href: "/courses", icon: "GraduationCap", roles: ["student"], section: "Aprendizaje" },
  { title: clinicalCopy.simulator, href: "/simulator", icon: "Brain", roles: ["student"], section: "Práctica clínica" },
  { title: clinicalCopy.evaluation, href: "/evaluation", icon: "BarChart3", roles: ["student"], section: "Seguimiento" },
];

const teacherNav: NavItem[] = [
  { title: "Panel docente", href: "/teacher", icon: "LayoutDashboard", roles: ["teacher"], section: "Principal", badge: "Inicio" },
  { title: "Cursos", href: "/teacher/courses", icon: "GraduationCap", roles: ["teacher"], section: "Académico" },
  { title: clinicalCopy.cases, href: "/teacher/cases", icon: "BookOpen", roles: ["teacher"], section: "Académico" },
  { title: clinicalCopy.students, href: "/teacher/students", icon: "Users", roles: ["teacher"], section: "Académico" },
  { title: "Sesiones programadas", href: "/teacher/simulations", icon: "CalendarClock", roles: ["teacher"], section: "Operaciones" },
  { title: clinicalCopy.tasks, href: "/teacher/assignments", icon: "ClipboardList", roles: ["teacher"], section: "Operaciones" },
  { title: clinicalCopy.evaluations, href: "/teacher/evaluations", icon: "FileBarChart", roles: ["teacher"], section: "Evaluación clínica" },
  { title: "Métricas clínicas", href: "/teacher/metrics", icon: "LineChart", roles: ["teacher"], section: "Evaluación clínica" },
  { title: clinicalCopy.feedback, href: "/teacher/feedback", icon: "MessageSquareText", roles: ["teacher"], section: "Evaluación clínica" },
  { title: clinicalCopy.simulator, href: "/simulator", icon: "Brain", roles: ["teacher"], section: "Herramientas" },
];

const adminNav: NavItem[] = [
  { title: "Administración", href: "/admin", icon: "LayoutDashboard", roles: ["admin"], section: "Institucional", badge: "Inicio" },
  { title: "Usuarios institucionales", href: "/admin/users", icon: "UserCog", roles: ["admin"], section: "Sistema" },
  { title: "Cursos", href: "/admin/courses", icon: "GraduationCap", roles: ["admin"], section: "Academia" },
  { title: clinicalCopy.cases, href: "/teacher/cases", icon: "BookOpen", roles: ["admin"], section: "Academia" },
  { title: "Configuración", href: "/admin/settings", icon: "SlidersHorizontal", roles: ["admin"], section: "Sistema" },
  { title: "Panel docente", href: "/teacher", icon: "GraduationCap", roles: ["admin"], section: "Academia" },
];

export function getNavigationForRole(role: UserRole): NavItem[] {
  switch (role) {
    case "teacher":
      return teacherNav;
    case "admin":
      return adminNav;
    default:
      return studentNav;
  }
}

export function groupNavigationBySection(items: NavItem[]): { section: string; items: NavItem[] }[] {
  const groups: { section: string; items: NavItem[] }[] = [];
  let currentSection = "";

  for (const item of items) {
    const section = item.section ?? "General";
    if (section !== currentSection) {
      currentSection = section;
      groups.push({ section, items: [] });
    }
    groups[groups.length - 1].items.push(item);
  }

  return groups;
}

export const evaluationSubNavigation: NavItem[] = [
  { title: "Análisis clínico", href: "/evaluation", icon: "FileBarChart", roles: ["student", "teacher"] },
  { title: "Bitácora de sesiones", href: "/evaluation/history", icon: "History", roles: ["student", "teacher"] },
];
