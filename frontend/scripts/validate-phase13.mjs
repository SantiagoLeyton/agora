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
  console.log("=== FASE 13 — Validación runtime ===\n");

  const health = await fetch(`${API}/actuator/health`);
  const healthBody = await health.json();
  console.log("Health:", health.status, healthBody.status);
  if (healthBody.status !== "UP") {
    throw new Error("Backend no está UP");
  }

  const admin = await login("admin@agora.com");
  const teacherAdmin = await login("docente_admin@agora.com");
  const teacher = await login("docente@agora.com");
  const student = await login("estudiante@agora.com");

  const attempts = await api(student, "GET", "/api/v1/attempts?estado=FINALIZADO&size=20");
  const attemptItems = Array.isArray(attempts.data?.content)
    ? attempts.data.content
    : Array.isArray(attempts.data)
      ? attempts.data
      : [];
  console.log("Intentos finalizados estudiante:", attempts.status, attemptItems.length);
  if (attempts.status !== 200 || attemptItems.length === 0) {
    throw new Error("Se requieren intentos finalizados del estudiante demo");
  }

  const latestAttempt = [...attemptItems].sort((a, b) => b.id - a.id)[0];
  const attemptId = latestAttempt.id;
  console.log("Intento evaluado:", attemptId, "nota:", latestAttempt.notaFinal);

  const rdaEval = await api(student, "GET", `/api/v1/attempts/${attemptId}/rda-evaluation`);
  console.log("GET /rda-evaluation:", rdaEval.status, rdaEval.data?.resultados?.length ?? 0);
  if (rdaEval.status !== 200 || !rdaEval.data?.resultados?.length) {
    throw new Error("Evaluación RDA no disponible");
  }
  const estados = new Set(rdaEval.data.resultados.map((item) => item.estado));
  console.log("Estados RDA:", [...estados].join(", "));

  const progress = await api(student, "GET", "/api/v1/academic-progress/me");
  console.log("GET /academic-progress/me:", progress.status, progress.data?.attempts?.length ?? 0);
  if (progress.status !== 200 || !progress.data?.attempts?.length) {
    throw new Error("Histórico longitudinal no disponible");
  }
  if (progress.data.attempts.length < 2) {
    throw new Error("Se requieren al menos 2 intentos para evolución longitudinal");
  }

  const studentId = latestAttempt.estudianteId;
  const teacherProgress = await api(teacher, "GET", `/api/v1/academic-progress/students/${studentId}`);
  console.log("GET /academic-progress/students (docente):", teacherProgress.status);
  if (teacherProgress.status !== 200) {
    throw new Error("Docente no puede consultar progreso del estudiante");
  }

  const foreignStudentId = studentId === 3 ? 1 : 3;
  const deniedProgress = await api(
    student,
    "GET",
    `/api/v1/academic-progress/students/${foreignStudentId}`
  );
  console.log("GET /academic-progress/students (estudiante ajeno, expect 403):", deniedProgress.status);
  if (deniedProgress.status !== 403) {
    throw new Error("Estudiante no debería consultar progreso de otros estudiantes");
  }

  const summary = await api(student, "GET", `/api/v1/attempts/${attemptId}/summary`);
  const teacherFeedback = summary.data?.retroalimentaciones?.filter((f) => f.autor === "DOCENTE") ?? [];
  const aiHistory = await api(student, "GET", `/api/v1/attempts/${attemptId}/ai/summary`);
  console.log(
    "Comparación feedback:",
    "docente=" + teacherFeedback.length,
    "ia=" + (aiHistory.data?.sintesis?.length ?? 0)
  );

  const metricsTeacher = await api(teacher, "GET", "/api/v1/teacher/metrics");
  console.log("GET /teacher/metrics (docente):", metricsTeacher.status);
  if (metricsTeacher.status !== 200 || !metricsTeacher.data?.pedagogicalInsights) {
    throw new Error("Métricas pedagógicas no disponibles para docente");
  }
  console.log(
    "Insights:",
    "avg=" + metricsTeacher.data.pedagogicalInsights.averageGrade,
    "rda=" + (metricsTeacher.data.pedagogicalInsights.rdaSummary?.length ?? 0)
  );

  const metricsAdmin = await api(admin, "GET", "/api/v1/teacher/metrics");
  console.log("GET /teacher/metrics (admin):", metricsAdmin.status);

  const metricsTeacherAdmin = await api(teacherAdmin, "GET", "/api/v1/teacher/metrics");
  console.log("GET /teacher/metrics (docente_admin):", metricsTeacherAdmin.status);
  if (metricsTeacherAdmin.status !== 200) {
    throw new Error("DOCENTE_ADMIN no puede acceder a métricas");
  }

  const adminRda = await api(admin, "GET", `/api/v1/attempts/${attemptId}/rda-evaluation`);
  console.log("GET /rda-evaluation (admin):", adminRda.status);

  const demoCase = await api(teacher, "GET", "/api/v1/cases?search=Demo%20Presentacion");
  const demoCount = demoCase.data?.content?.length ?? demoCase.data?.length ?? 0;
  console.log("Caso demo presentación:", demoCount > 0 ? "OK" : "no encontrado por búsqueda");

  console.log("\nPASS — FASE 13 runtime validada");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
