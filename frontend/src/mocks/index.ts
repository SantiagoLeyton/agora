import type { SimulationCase, Scene, DashboardStat } from "@/types";

export const mockCases: SimulationCase[] = [
  {
    id: "case-anxiety-001",
    title: "Ansiedad generalizada en contexto universitario",
    description:
      "Paciente de 22 años presenta síntomas de ansiedad relacionados con exámenes finales, dificultades de concentración y tensión muscular persistente.",
    category: "Trastornos de ansiedad",
    difficulty: "intermediate",
    durationMinutes: 45,
    status: "in_progress",
    progress: 35,
    tags: ["ansiedad", "universidad", "TCC"],
    learningObjectives: [
      "Identificar manifestaciones somáticas de ansiedad",
      "Aplicar técnicas de exploración emocional",
      "Evaluar factores estresores académicos",
    ],
    patientModel: "haru",
  },
  {
    id: "case-depression-002",
    title: "Episodio depresivo leve post-duelo",
    description:
      "Adulto de 35 años refiere tristeza persistente tras pérdida reciente, anhedonia parcial y alteraciones del sueño.",
    category: "Estados depresivos",
    difficulty: "advanced",
    durationMinutes: 60,
    status: "not_started",
    progress: 0,
    tags: ["depresión", "duelo", "evaluación clínica"],
    learningObjectives: [
      "Diferenciar duelo normativo de episodio depresivo",
      "Explorar red de apoyo social",
      "Identificar señales de riesgo",
    ],
    patientModel: "natori",
  },
  {
    id: "case-crisis-003",
    title: "Intervención en crisis suicida",
    description:
      "Evaluación de riesgo en paciente con ideación pasiva, historial de intentos previos y desarticulación del sistema de apoyo.",
    category: "Intervención en crisis",
    difficulty: "advanced",
    durationMinutes: 50,
    status: "completed",
    progress: 100,
    tags: ["crisis", "riesgo suicida", "protocolo"],
    learningObjectives: [
      "Aplicar protocolo de evaluación de riesgo",
      "Establecer contención emocional",
      "Activar red de contención institucional",
    ],
    patientModel: "haru",
  },
  {
    id: "case-family-004",
    title: "Conflicto familiar y comunicación disfuncional",
    description:
      "Sesión con adolescente de 16 años que presenta conductas de evitación y distanciamiento familiar progresivo.",
    category: "Dinámica familiar",
    difficulty: "basic",
    durationMinutes: 40,
    status: "not_started",
    progress: 0,
    tags: ["familia", "adolescencia", "comunicación"],
    learningObjectives: [
      "Explorar patrones de comunicación familiar",
      "Identificar roles disfuncionales",
      "Promover escucha activa",
    ],
    patientModel: "natori",
  },
];

export const mockScenes: Record<string, Scene[]> = {
  "case-anxiety-001": [
    {
      id: "scene-1",
      title: "Primera consulta",
      setting: "Consultorio universitario — Sesión inicial",
      narrative:
        "He tenido problemas de ansiedad últimamente. Siento que no puedo concentrarme para estudiar y me duele el pecho cuando pienso en los exámenes finales. Duermo mal y me despierto con la sensación de que algo malo va a pasar.",
      speaker: "María González",
      speakerRole: "patient",
      supportTools: ["Escala GAD-7", "Registro de pensamientos", "Guía de entrevista clínica"],
      options: [
        {
          id: "opt-1a",
          label: "Explorar emociones",
          description: "Profundizar en la experiencia emocional y somática",
          nextSceneId: "scene-2a",
          category: "explore",
        },
        {
          id: "opt-1b",
          label: "Preguntar antecedentes",
          description: "Indagar historial académico y personal",
          nextSceneId: "scene-2b",
          category: "assess",
        },
        {
          id: "opt-1c",
          label: "Recomendar técnica",
          description: "Introducir estrategia de regulación inmediata",
          nextSceneId: "scene-2c",
          category: "intervene",
        },
        {
          id: "opt-1d",
          label: "Finalizar sesión",
          description: "Cerrar la consulta prematuramente",
          nextSceneId: "scene-end-premature",
          category: "close",
        },
      ],
    },
    {
      id: "scene-2a",
      title: "Exploración emocional",
      setting: "Consultorio universitario — Profundización",
      narrative:
        "Cuando me siento así, es como si todo se acumulara. Primero es el miedo a reprobar, luego la culpa por no haber estudiado lo suficiente, y al final siento que no voy a poder con todo esto.",
      speaker: "María González",
      speakerRole: "patient",
      options: [
        {
          id: "opt-2a-1",
          label: "Validar emociones",
          description: "Reconocer y normalizar la experiencia",
          nextSceneId: "scene-3",
          category: "explore",
        },
        {
          id: "opt-2a-2",
          label: "Identificar pensamientos automáticos",
          description: "Explorar cogniciones asociadas",
          nextSceneId: "scene-3",
          category: "assess",
        },
        {
          id: "opt-2a-3",
          label: "Proponer plan de estudio",
          description: "Derivar hacia solución práctica",
          nextSceneId: "scene-3",
          category: "intervene",
        },
      ],
    },
    {
      id: "scene-2b",
      title: "Exploración de antecedentes",
      setting: "Consultorio universitario — Anamnesis",
      narrative:
        "Siempre fui buena estudiante, pero este semestre todo cambió. Mis padres esperan que saque las mejores notas y siento mucha presión. Además, dejé de ver a mis amigos porque no tengo tiempo.",
      speaker: "María González",
      speakerRole: "patient",
      options: [
        {
          id: "opt-2b-1",
          label: "Explorar presión familiar",
          nextSceneId: "scene-3",
          category: "explore",
        },
        {
          id: "opt-2b-2",
          label: "Evaluar aislamiento social",
          nextSceneId: "scene-3",
          category: "assess",
        },
      ],
    },
    {
      id: "scene-2c",
      title: "Intervención temprana",
      setting: "Consultorio universitario",
      narrative:
        "Entiendo que quiera ayudarme rápido, pero siento que no me escuchó del todo. ¿Podemos hablar más de lo que siento antes de las técnicas?",
      speaker: "María González",
      speakerRole: "patient",
      options: [
        {
          id: "opt-2c-1",
          label: "Retomar exploración emocional",
          nextSceneId: "scene-2a",
          category: "explore",
        },
        {
          id: "opt-2c-2",
          label: "Explicar importancia de la escucha",
          nextSceneId: "scene-3",
          category: "intervene",
        },
      ],
    },
    {
      id: "scene-3",
      title: "Cierre de sesión",
      setting: "Consultorio universitario — Síntesis",
      narrative:
        "Me siento un poco más comprendida. Creo que necesito aprender a manejar esta presión sin sentir que todo depende de un solo examen.",
      speaker: "María González",
      speakerRole: "patient",
      options: [
        {
          id: "opt-3-1",
          label: "Acordar plan terapéutico",
          nextSceneId: "scene-end-success",
          category: "intervene",
        },
        {
          id: "opt-3-2",
          label: "Programar próxima sesión",
          nextSceneId: "scene-end-success",
          category: "close",
        },
      ],
    },
    {
      id: "scene-end-success",
      title: "Sesión completada",
      setting: "Resumen clínico",
      narrative:
        "Has completado la simulación. Tu enfoque priorizó la contención emocional y la exploración de factores estresores, alineándose con buenas prácticas en intervención psicológica universitaria.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
    {
      id: "scene-end-premature",
      title: "Sesión finalizada prematuramente",
      setting: "Resumen clínico",
      narrative:
        "La sesión fue cerrada antes de completar la evaluación. En contextos de ansiedad, es fundamental permitir que el paciente exprese su experiencia antes de concluir.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
  ],
  "case-depression-002": [
    {
      id: "scene-d1",
      title: "Primera consulta — duelo",
      setting: "Consultorio ambulatorio",
      narrative:
        "Hace tres meses perdí a mi madre y desde entonces nada me importa igual. Me cuesta levantarme, dejé actividades que disfrutaba y siento un vacío que no se va.",
      speaker: "Carlos Méndez",
      speakerRole: "patient",
      options: [
        {
          id: "opt-d1a",
          label: "Explorar el duelo",
          description: "Validar la pérdida y el proceso",
          nextSceneId: "scene-d2",
          category: "explore",
        },
        {
          id: "opt-d1b",
          label: "Evaluar síntomas depresivos",
          description: "Indagar sueño, apetito y anhedonia",
          nextSceneId: "scene-d2",
          category: "assess",
        },
      ],
    },
    {
      id: "scene-d2",
      title: "Profundización",
      setting: "Consultorio ambulatorio",
      narrative:
        "A veces pienso que debería estar mejor ya, y eso me hace sentir culpable. No quiero preocupar a mi familia, pero tampoco tengo fuerzas para fingir que estoy bien.",
      speaker: "Carlos Méndez",
      speakerRole: "patient",
      options: [
        {
          id: "opt-d2a",
          label: "Normalizar el proceso",
          nextSceneId: "scene-d-end",
          category: "explore",
        },
        {
          id: "opt-d2b",
          label: "Explorar red de apoyo",
          nextSceneId: "scene-d-end",
          category: "assess",
        },
      ],
    },
    {
      id: "scene-d-end",
      title: "Sesión completada",
      setting: "Resumen clínico",
      narrative:
        "Has completado la simulación de duelo y episodio depresivo leve. Revisa tu enfoque en diferenciación clínica y contención emocional.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
  ],
  "case-crisis-003": [
    {
      id: "scene-crisis-1",
      title: "Evaluación de riesgo",
      setting: "Urgencias psicológicas — Protocolo de crisis",
      narrative:
        "Últimamente pienso que a nadie le importaría si ya no estuviera. No tengo un plan concreto, pero a veces imagino cómo sería no despertar.",
      speaker: "Laura Vega",
      speakerRole: "patient",
      options: [
        {
          id: "opt-c1a",
          label: "Evaluar ideación y plan",
          description: "Aplicar protocolo de riesgo suicida",
          nextSceneId: "scene-crisis-2",
          category: "assess",
        },
        {
          id: "opt-c1b",
          label: "Contención emocional",
          description: "Priorizar escucha y seguridad",
          nextSceneId: "scene-crisis-2",
          category: "explore",
        },
        {
          id: "opt-c1c",
          label: "Minimizar la preocupación",
          description: "Indicar que exagera",
          nextSceneId: "scene-crisis-end-risk",
          category: "close",
        },
      ],
    },
    {
      id: "scene-crisis-2",
      title: "Contención y plan de seguridad",
      setting: "Urgencias psicológicas",
      narrative:
        "Gracias por no juzgarme. Me da miedo pedir ayuda porque siento que fallé, pero quiero intentar estar a salvo esta noche.",
      speaker: "Laura Vega",
      speakerRole: "patient",
      options: [
        {
          id: "opt-c2a",
          label: "Acordar plan de seguridad",
          nextSceneId: "scene-crisis-end",
          category: "intervene",
        },
        {
          id: "opt-c2b",
          label: "Activar red de contención",
          nextSceneId: "scene-crisis-end",
          category: "intervene",
        },
      ],
    },
    {
      id: "scene-crisis-end",
      title: "Intervención registrada",
      setting: "Resumen clínico",
      narrative:
        "Simulación de crisis completada. Tu intervención priorizó evaluación de riesgo y contención según protocolo institucional.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
    {
      id: "scene-crisis-end-risk",
      title: "Cierre inadecuado",
      setting: "Resumen clínico",
      narrative:
        "Minimizar ideación suicida incrementa el riesgo. En crisis, la validación y la evaluación estructurada son prioritarias.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
  ],
  "case-family-004": [
    {
      id: "scene-f1",
      title: "Sesión con adolescente",
      setting: "Consultorio — Primera entrevista",
      narrative:
        "En casa nadie me escucha. Mis padres discuten todo el tiempo y yo prefiero quedarme en el cuarto. No quiero hablar de ellos, pero estoy cansado de fingir que no me afecta.",
      speaker: "Diego Rojas",
      speakerRole: "patient",
      options: [
        {
          id: "opt-f1a",
          label: "Explorar dinámica familiar",
          nextSceneId: "scene-f2",
          category: "explore",
        },
        {
          id: "opt-f1b",
          label: "Validar su experiencia",
          nextSceneId: "scene-f2",
          category: "explore",
        },
        {
          id: "opt-f1c",
          label: "Culpar a los padres",
          nextSceneId: "scene-f-end-premature",
          category: "intervene",
        },
      ],
    },
    {
      id: "scene-f2",
      title: "Comunicación y límites",
      setting: "Consultorio",
      narrative:
        "Cuando usted me pregunta sin presionarme, me siento menos a la defensiva. Quisiera que en casa también fuera así, pero no sé cómo pedirlo.",
      speaker: "Diego Rojas",
      speakerRole: "patient",
      options: [
        {
          id: "opt-f2a",
          label: "Trabajar escucha activa",
          nextSceneId: "scene-f-end",
          category: "intervene",
        },
        {
          id: "opt-f2b",
          label: "Planificar sesión familiar",
          nextSceneId: "scene-f-end",
          category: "assess",
        },
      ],
    },
    {
      id: "scene-f-end",
      title: "Sesión completada",
      setting: "Resumen clínico",
      narrative:
        "Has completado la simulación de conflicto familiar. El enfoque en escucha y roles disfuncionales favorece la alianza terapéutica.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
    {
      id: "scene-f-end-premature",
      title: "Intervención desalineada",
      setting: "Resumen clínico",
      narrative:
        "Atribuir culpa sin exploración puede cerrar la alianza con el adolescente. Prioriza validación antes de reinterpretar roles familiares.",
      speaker: "Supervisor clínico",
      speakerRole: "supervisor",
      options: [],
    },
  ],
};

export const mockDashboardStats: DashboardStat[] = [
  { label: "Casos completados", value: 12, change: "+3 este mes", trend: "up" },
  { label: "Promedio de evaluación", value: "81%", change: "+5%", trend: "up" },
  { label: "Tiempo de práctica", value: "18h", change: "Estable", trend: "neutral" },
  { label: "Casos en progreso", value: 2, change: "1 pendiente", trend: "neutral" },
];

export const mockTeacherStats: DashboardStat[] = [
  { label: "Estudiantes activos", value: 57, change: "+4", trend: "up" },
  { label: "Promedio grupal", value: "72%", change: "+2%", trend: "up" },
  { label: "Asignaciones activas", value: 5, change: "2 por vencer", trend: "neutral" },
  { label: "Estudiantes en riesgo", value: 3, change: "Requieren seguimiento", trend: "down" },
];

export const mockAdminStats: DashboardStat[] = [
  { label: "Usuarios registrados", value: 342, change: "+28", trend: "up" },
  { label: "Instituciones", value: 4, change: "Estable", trend: "neutral" },
  { label: "Casos publicados", value: 18, change: "+2", trend: "up" },
  { label: "Sesiones este mes", value: 1240, change: "+15%", trend: "up" },
];
