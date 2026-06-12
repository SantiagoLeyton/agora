#!/usr/bin/env node

const API = process.env.API_URL ?? "http://localhost:8080";
const PASSWORD = "Agora12345*";

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function login(email) {
  const res = await api(null, "POST", "/api/v1/auth/login", {
    correo: email,
    password: PASSWORD,
  });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.accessToken;
}

async function main() {
  console.log("=== FASE 11 UNIFICADA — Validación runtime ===\n");

  const health = await fetch(`${API}/actuator/health`);
  console.log("Health:", health.status, (await health.json()).status);

  const admin = await login("admin@agora.com");
  const teacher = await login("docente@agora.com");
  const student = await login("estudiante@agora.com");

  const metrics = await api(teacher, "GET", "/api/v1/teacher/metrics");
  console.log("GET /teacher/metrics:", metrics.status);

  const groupRes = await api(teacher, "POST", "/api/v1/groups", {
    nombre: `Grupo Fase 11 ${Date.now()}`,
    descripcion: "Grupo de validación trazabilidad",
    periodo: "2026-1",
  });
  if (groupRes.status !== 201) {
    throw new Error(`Create group failed: ${groupRes.status} ${JSON.stringify(groupRes.data)}`);
  }
  const groupId = groupRes.data.id;
  console.log("Grupo creado:", groupId);

  const enrollRes = await api(teacher, "POST", `/api/v1/groups/${groupId}/students`, {
    estudianteId: 3,
  });
  console.log("Estudiante matriculado:", enrollRes.status);

  const caseRes = await api(teacher, "POST", "/api/v1/cases", {
    titulo: `Caso Fase 11 ${Date.now()}`,
    descripcion: "Caso con calificación configurada",
    objetivo: "Validar nota 0-5",
    nivelDificultad: "BASICO",
    duracionEstimada: 30,
  });
  if (caseRes.status !== 201) {
    throw new Error(`Create case failed: ${caseRes.status}`);
  }
  const casoId = caseRes.data.id;
  const sceneRes = await api(teacher, "POST", `/api/v1/cases/${casoId}/scenes`, {
    orden: 1,
    titulo: "Escena 1",
    descripcion: "Consulta",
    contenido: "Paciente con ansiedad",
    activo: true,
  });
  const sceneId = sceneRes.data.id;
  const questionRes = await api(teacher, "POST", `/api/v1/scenes/${sceneId}/questions`, {
    enunciado: "¿Cómo validarías la calificación?",
    obligatoria: true,
    activo: true,
    pesoPuntos: 1,
  });
  const questionId = questionRes.data.id;
  const optionA = await api(teacher, "POST", `/api/v1/questions/${questionId}/options`, {
    texto: "Opción óptima",
    descripcion: "100%",
    orden: 1,
    activo: true,
    porcentajeCredito: 100,
  });
  await api(teacher, "POST", `/api/v1/questions/${questionId}/options`, {
    texto: "Opción parcial",
    descripcion: "50%",
    orden: 2,
    activo: true,
    porcentajeCredito: 50,
  });
  console.log("Caso con calificación creado:", casoId);

  const now = new Date();
  const start = new Date(now.getTime() - 60_000).toISOString();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const scheduleRes = await api(teacher, "POST", "/api/v1/schedules", {
    grupoId: groupId,
    casoId,
    fechaInicio: start,
    fechaFin: end,
  });
  if (scheduleRes.status !== 201) {
    throw new Error(`Create schedule failed: ${scheduleRes.status} ${JSON.stringify(scheduleRes.data)}`);
  }
  const programacionId = scheduleRes.data.id;
  console.log("Programación creada:", programacionId, "caso:", casoId);

  const studentSchedules = await api(student, "GET", "/api/v1/schedules?size=20");
  const visibleSchedule = studentSchedules.data.content?.some((s) => s.id === programacionId);
  console.log("Estudiante ve programación:", visibleSchedule);

  const startSim = await api(student, "POST", "/api/v1/simulations/start", {
    casoId,
    programacionId,
  });
  if (startSim.status !== 201) {
    throw new Error(`Start simulation failed: ${startSim.status} ${JSON.stringify(startSim.data)}`);
  }
  const attemptId = startSim.data.intentoId;
  console.log("Intento académico creado:", attemptId);

  const attempt = await api(student, "GET", `/api/v1/attempts/${attemptId}`);
  console.log("programacion_id:", attempt.data.programacionId);

  await api(student, "POST", `/api/v1/simulations/${attemptId}/answer`, {
    preguntaId: questionId,
    opcionId: optionA.data.id,
  });

  const finish = await api(student, "POST", `/api/v1/simulations/${attemptId}/finish`);
  console.log("Finalizar simulación:", finish.status);
  console.log("Nota final:", finish.data?.intento?.notaFinal ?? attempt.data.notaFinal);

  const teacherAttempts = await api(teacher, "GET", "/api/v1/attempts?size=50");
  const teacherSeesAttempt = teacherAttempts.data.content?.some((a) => a.id === attemptId);
  console.log("Docente ve intento:", teacherSeesAttempt, "total:", teacherAttempts.data.totalElements);

  const feedbackRes = await api(teacher, "POST", `/api/v1/attempts/${attemptId}/feedback`, {
    contenido: "Retroalimentación Fase 11",
    observaciones: "Validación runtime",
  });
  console.log("POST feedback docente:", feedbackRes.status);

  const metricsAfter = await api(teacher, "GET", "/api/v1/teacher/metrics");
  console.log("Métricas completadas:", metricsAfter.data?.overview?.completedAttempts);

  const gradedAttempt = await api(student, "GET", `/api/v1/attempts/${attemptId}`);
  const hasGrade = gradedAttempt.data.notaFinal != null;
  console.log("Nota verificada en intento:", gradedAttempt.data.notaFinal);

  const ok =
    metrics.status === 200 &&
    attempt.data.programacionId === programacionId &&
    teacherSeesAttempt &&
    feedbackRes.status === 201 &&
    metricsAfter.status === 200 &&
    hasGrade;

  console.log(ok ? "\nFASE 11 RUNTIME VALIDATION: PASS" : "\nFASE 11 RUNTIME VALIDATION: FAIL");
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
