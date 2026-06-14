import type { UserRole } from "@/types";
import { getTimeGreeting } from "@/lib/greeting";
import { BRAND } from "@/lib/branding";
import { clinicalCopy } from "@/lib/clinical-copy";

export interface PageHeroMeta {
  eyebrow?: string;
  title: string;
  description: string;
}

const routeHero: Record<string, PageHeroMeta> = {
  "/dashboard": {
    eyebrow: BRAND.institutionName,
    title: "Espacio académico clínico",
    description: "Simulación psicosocial, análisis clínico y seguimiento de competencias terapéuticas.",
  },
  "/courses": {
    eyebrow: "Aprendizaje",
    title: "Mis cursos",
    description: "Cursos matriculados, simulaciones asignadas e historial académico.",
  },
  "/dashboard/sessions": {
    eyebrow: "Programación académica",
    title: "Mis sesiones asignadas",
    description: "Sesiones clínicas programadas por tu docente dentro de tus cursos.",
  },
  "/simulator": {
    eyebrow: "Práctica clínica inmersiva",
    title: clinicalCopy.simulator,
    description: "Expedientes narrativos interactivos en entorno seguro y supervisado.",
  },
  "/evaluation": {
    eyebrow: "Retroalimentación formativa",
    title: clinicalCopy.evaluation,
    description: "Desempeño clínico, competencias y recomendaciones terapéuticas personalizadas.",
  },
  "/evaluation/history": {
    eyebrow: "Bitácora clínica",
    title: "Historial de sesiones",
    description: "Registro completo de simulaciones y análisis clínicos.",
  },
  "/teacher": {
    eyebrow: "Gestión académica",
    title: "Centro de supervisión clínica",
    description: "Expedientes, participantes, sesiones y seguimiento terapéutico.",
  },
  "/teacher/cases": {
    eyebrow: "Contenido clínico",
    title: clinicalCopy.cases,
    description: "Diseña y publica experiencias de simulación psicológica.",
  },
  "/teacher/students": {
    eyebrow: "Seguimiento",
    title: clinicalCopy.students,
    description: "Progreso clínico, riesgo formativo y actividad reciente.",
  },
  "/teacher/courses": {
    eyebrow: "Organización académica",
    title: "Cursos",
    description: "Gestiona estudiantes, simulaciones y programaciones por curso.",
  },
  "/admin/courses": {
    eyebrow: "Gobierno académico",
    title: "Cursos institucionales",
    description: "Crea cursos, asigna docentes y administra matrículas.",
  },
  "/teacher/simulations": {
    eyebrow: "Calendario clínico",
    title: "Sesiones programadas",
    description: "Agenda simulaciones y asigna expedientes por cohorte.",
  },
  "/teacher/assignments": {
    eyebrow: "Asignaciones",
    title: clinicalCopy.tasks,
    description: "Control de cumplimiento y fechas límite formativas.",
  },
  "/teacher/evaluations": {
    eyebrow: "Evaluación",
    title: "Revisiones de análisis clínico",
    description: "Desempeño de participantes por simulación.",
  },
  "/teacher/metrics": {
    eyebrow: "Analítica clínica",
    title: "Métricas terapéuticas",
    description: "Indicadores del semestre y competencias grupales.",
  },
  "/teacher/feedback": {
    eyebrow: "Formativa",
    title: clinicalCopy.feedback,
    description: "Observaciones clínicas y seguimiento personalizado.",
  },
  "/teacher/grades": {
    eyebrow: "Seguimiento académico",
    title: "Calificaciones",
    description: "Libro de calificaciones, RDA, feedback y exportación por curso y caso.",
  },
  "/admin": {
    eyebrow: "Institucional",
    title: "Administración",
    description: "Usuarios, permisos y configuración de la plataforma clínica.",
  },
  "/admin/users": {
    eyebrow: "Accesos",
    title: "Usuarios institucionales",
    description: "Cuentas, roles y permisos del ecosistema académico.",
  },
  "/admin/settings": {
    eyebrow: "Sistema",
    title: "Configuración",
    description: "Parámetros académicos y políticas de simulación.",
  },
  "/admin/grades": {
    eyebrow: "Seguimiento académico",
    title: "Calificaciones institucionales",
    description: "Consulta global de intentos, notas, RDA y exportaciones.",
  },
};

export function getPageHeroMeta(pathname: string): PageHeroMeta {
  if (pathname.match(/\/evaluation\/results\//)) {
    return {
      eyebrow: "Resultado clínico",
      title: "Análisis de desempeño",
      description: "Retroalimentación terapéutica detallada y competencias evaluadas.",
    };
  }
  if (pathname.match(/\/simulator\/[^/]+$/) && !pathname.includes("/play")) {
    return {
      eyebrow: "Expediente",
      title: "Ficha del expediente clínico",
      description: "Contexto, objetivos y preparación de la sesión.",
    };
  }
  if (pathname.includes("/play")) {
    return {
      eyebrow: "Sesión activa",
      title: "Simulación en curso",
      description: "Experiencia narrativa clínica interactiva.",
    };
  }
  return routeHero[pathname] ?? {
    eyebrow: BRAND.platformName,
    title: "Plataforma clínica académica",
    description: BRAND.institutionName,
  };
}

export function getPersonalizedHeroTitle(role: UserRole, firstName?: string): string {
  if (role === "student" && firstName) {
    return `${getTimeGreeting()}, ${firstName}`;
  }
  if (role === "teacher") return "Centro de supervisión clínica";
  if (role === "admin") return "Control institucional";
  return "Bienvenido";
}

export function getRoleWorkspaceLabel(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "Espacio de supervisión";
    case "admin":
      return "Administración clínica";
    default:
      return "Espacio del participante";
  }
}
