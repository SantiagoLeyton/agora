#!/usr/bin/env node

const API = process.env.API_URL ?? "http://localhost:8080";
const PASSWORD = "Agora12345*";

async function login(email) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  return (await res.json()).accessToken;
}

async function getMetrics(token) {
  const res = await fetch(`${API}/api/v1/teacher/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log("=== Fase 10B — Validación runtime Métricas ===\n");

  const health = await fetch(`${API}/actuator/health`);
  console.log("Health:", health.status, (await health.json()).status);

  const admin = await login("admin@agora.com");
  const teacher = await login("docente@agora.com");

  const adminMetrics = await getMetrics(admin);
  console.log("GET /teacher/metrics (admin):", adminMetrics.status);

  const teacherMetrics = await getMetrics(teacher);
  console.log("GET /teacher/metrics (docente):", teacherMetrics.status);

  if (adminMetrics.status !== 200) {
    console.error("Admin metrics failed:", JSON.stringify(adminMetrics.data).slice(0, 500));
    process.exit(1);
  }

  const emotional = adminMetrics.data.emotionalProfile ?? [];
  const names = emotional.map((item) => item.name);
  const forbidden = ["Empatía clínica", "Comunicación terapéutica", "Evaluación de riesgo", "Toma de decisiones"];
  const hasForbidden = forbidden.some((label) => JSON.stringify(adminMetrics.data).includes(label));

  console.log("Emotional axes:", names.join(", "));
  console.log("Overview:", adminMetrics.data.overview);
  console.log("Sample size:", adminMetrics.data.metadata?.sampleSize);
  console.log("Forbidden mock labels present:", hasForbidden);

  const ok =
    adminMetrics.status === 200 &&
    teacherMetrics.status === 200 &&
    names.includes("ANSIEDAD") &&
    names.includes("CONFIANZA") &&
    !hasForbidden;

  console.log(ok ? "\nFASE 10B RUNTIME VALIDATION: PASS" : "\nFASE 10B RUNTIME VALIDATION: FAIL");
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
