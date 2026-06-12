#!/usr/bin/env node
/**
 * Runtime validation for Phase 9 — teacher therapeutic feedback.
 */

const API = process.env.API_URL ?? "http://localhost:8080";
const PASSWORD = "Agora12345*";

async function req(method, path, token, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return { status: res.status, data };
}

async function login(email) {
  const { data } = await req("POST", "/api/v1/auth/login", null, {
    correo: email,
    password: PASSWORD,
  });
  return data.accessToken;
}

async function main() {
  console.log("=== Fase 9 — Validación runtime Retroalimentación ===\n");

  const health = await req("GET", "/actuator/health");
  console.log("Health:", health.status, health.data?.status);

  const admin = await login("admin@agora.com");
  const teacher = await login("docente@agora.com");

  const attemptsAdmin = await req("GET", "/api/v1/attempts?size=20", admin);
  console.log("GET /attempts (admin):", attemptsAdmin.status, "total:", attemptsAdmin.data?.totalElements);

  const attemptsTeacher = await req("GET", "/api/v1/attempts?size=20", teacher);
  console.log("GET /attempts (docente):", attemptsTeacher.status, "total:", attemptsTeacher.data?.totalElements);

  const attemptId = attemptsAdmin.data?.content?.find((a) => a.estado === "FINALIZADO")?.id;
  if (!attemptId) {
    console.error("No finalized attempt found for validation");
    process.exit(1);
  }

  const getFeedback = await req("GET", `/api/v1/attempts/${attemptId}/feedback`, admin);
  console.log(`GET /attempts/${attemptId}/feedback:`, getFeedback.status, "items:", getFeedback.data?.length);

  const postFeedback = await req(
    "POST",
    `/api/v1/attempts/${attemptId}/feedback`,
    admin,
    {
      contenido: "Validación Fase 9 — retroalimentación docente integrada",
      observaciones: "Runtime test",
    }
  );
  console.log(`POST /attempts/${attemptId}/feedback (admin):`, postFeedback.status, postFeedback.data?.autor);

  const postTeacher403 = await req(
    "POST",
    `/api/v1/attempts/${attemptId}/feedback`,
    teacher,
    {
      contenido: "Intento docente sin programación",
      observaciones: null,
    }
  );
  console.log(`POST /attempts/${attemptId}/feedback (docente sin vínculo):`, postTeacher403.status);

  const getAfter = await req("GET", `/api/v1/attempts/${attemptId}/feedback`, admin);
  const docenteCount = getAfter.data?.filter((f) => f.autor === "DOCENTE").length ?? 0;
  console.log("Feedback DOCENTE count after POST:", docenteCount);

  const ok =
    health.status === 200 &&
    attemptsAdmin.status === 200 &&
    getFeedback.status === 200 &&
    postFeedback.status === 201 &&
    postTeacher403.status === 403 &&
    docenteCount >= 1;

  console.log("\n--- Resultado ---");
  console.log(ok ? "FASE 9 RUNTIME VALIDATION: PASS" : "FASE 9 RUNTIME VALIDATION: FAIL");
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
