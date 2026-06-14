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
  return { status: res.status, data, headers: res.headers, raw: text };
}

async function apiBlob(token, path) {
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blob = await res.arrayBuffer();
  return { status: res.status, size: blob.byteLength };
}

async function login(email) {
  const res = await api(null, "POST", "/api/v1/auth/login", {
    correo: email,
    password: PASSWORD,
  });
  if (res.status !== 200) throw new Error(`Login failed for ${email}: ${res.status}`);
  return res.data.accessToken;
}

async function main() {
  console.log("=== CORRECCIÓN MAYOR 5 — Validación runtime ===\n");

  const admin = await login("admin@agora.com");
  const teacher = await login("docente@agora.com");
  const teacherAdmin = await login("docente_admin@agora.com");
  const student = await login("estudiante@agora.com");

  const studentForbidden = await api(student, "GET", "/api/v1/gradebook/entries");
  console.log("Estudiante gradebook entries:", studentForbidden.status);
  if (studentForbidden.status !== 403) {
    throw new Error("El estudiante debe recibir 403 en gradebook");
  }

  const teacherEntries = await api(teacher, "GET", "/api/v1/gradebook/entries?size=20");
  console.log("Docente entries:", teacherEntries.status, teacherEntries.data?.totalElements ?? 0);
  if (teacherEntries.status !== 200) throw new Error("Docente no puede listar calificaciones");

  const adminEntries = await api(admin, "GET", "/api/v1/gradebook/entries?size=20");
  const teacherAdminEntries = await api(teacherAdmin, "GET", "/api/v1/gradebook/entries?size=20");
  console.log("Admin / docente_admin entries:", adminEntries.status, teacherAdminEntries.status);
  if (adminEntries.status !== 200 || teacherAdminEntries.status !== 200) {
    throw new Error("Admin y docente_admin deben acceder al gradebook");
  }

  const filtered = await api(teacher, "GET", "/api/v1/gradebook/entries?estado=Finalizado&size=20");
  console.log("Filtro estado Finalizado:", filtered.status, filtered.data?.numberOfElements ?? 0);
  if (filtered.status !== 200) throw new Error("Filtro de estado falló");

  const analytics = await api(teacher, "GET", "/api/v1/gradebook/analytics");
  console.log(
    "Analítica:",
    analytics.status,
    analytics.data?.umbralAprobacion,
    analytics.data?.aprobados,
    analytics.data?.reprobados
  );
  if (analytics.status !== 200) throw new Error("Analítica gradebook falló");

  const firstAttempt = teacherEntries.data?.content?.[0]?.attemptId
    ?? adminEntries.data?.content?.[0]?.attemptId;
  if (firstAttempt) {
    const detail = await api(teacher, "GET", `/api/v1/gradebook/entries/${firstAttempt}/detail`);
    console.log(
      "Detalle intento:",
      detail.status,
      detail.data?.entry?.notaFinal,
      detail.data?.historial?.length ?? 0
    );
    if (detail.status !== 200) throw new Error("Detalle de intento falló");
  } else {
    console.log("Sin intentos previos: se omite detalle (crear simulación manualmente si es necesario)");
  }

  const csv = await apiBlob(teacher, "/api/v1/gradebook/export?format=csv");
  const excel = await apiBlob(admin, "/api/v1/gradebook/export?format=excel");
  console.log("Export CSV / Excel:", csv.status, csv.size, excel.status, excel.size);
  if (csv.status !== 200 || csv.size === 0) throw new Error("Export CSV falló");
  if (excel.status !== 200 || excel.size === 0) throw new Error("Export Excel falló");

  const notaFilter = await api(teacher, "GET", "/api/v1/gradebook/entries?notaMinima=0&notaMaxima=5&size=5");
  console.log("Filtro nota min/max:", notaFilter.status);
  if (notaFilter.status !== 200) throw new Error("Filtro de nota falló");

  console.log("\nPASS — CORRECCIÓN MAYOR 5 runtime validada (backend)");
}

main().catch((error) => {
  console.error("\nFAIL —", error.message);
  process.exit(1);
});
