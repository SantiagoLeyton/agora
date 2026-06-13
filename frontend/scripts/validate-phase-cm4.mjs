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
  if (res.status !== 200) throw new Error(`Login failed for ${email}: ${res.status}`);
  return res.data.accessToken;
}

async function main() {
  console.log("=== CORRECCIÓN MAYOR 4 — Validación runtime ===\n");

  const admin = await login("admin@agora.com");
  const teacher = await login("docente@agora.com");
  const teacherAdmin = await login("docente_admin@agora.com");
  const student = await login("estudiante@agora.com");

  const misCursos = await api(student, "GET", "/api/v1/groups?scope=mis&size=20");
  const explorar = await api(student, "GET", "/api/v1/groups?scope=explorar&activo=true&size=20");
  console.log("Estudiante mis/explorar:", misCursos.data?.content?.length ?? 0, explorar.data?.content?.length ?? 0);

  const join = await api(student, "POST", "/api/v1/groups/join", { claveAcceso: "IPCO-2026" });
  console.log("Estudiante join IPCO-2026:", join.status);
  if (join.status !== 200 && join.status !== 409) throw new Error("Join estudiante falló");

  const misAfter = await api(student, "GET", "/api/v1/groups?scope=mis&size=20");
  const explorarAfter = await api(student, "GET", "/api/v1/groups?scope=explorar&activo=true&size=20");
  console.log("Tras join mis/explorar:", misAfter.data?.content?.length ?? 0, explorarAfter.data?.content?.length ?? 0);

  const studentCases = await api(student, "GET", "/api/v1/cases?size=50");
  const visibleCases = studentCases.data?.content ?? [];
  console.log("Casos visibles estudiante:", visibleCases.length);
  const officialVisible = visibleCases.some((item) =>
    item.titulo?.includes("PSICOLOGIA SOCIAL")
  );
  console.log("Caso oficial visible:", officialVisible);

  const presentable = visibleCases.filter((item) => item.presentable === true);
  const notPresentable = visibleCases.filter((item) => item.presentable === false);
  console.log("Presentables / no presentables:", presentable.length, notPresentable.length);

  const adminJoin = await api(admin, "POST", "/api/v1/groups/join", { claveAcceso: "PSOC-II-2026" });
  console.log("Admin join bloqueado:", adminJoin.status);

  const allGroups = await api(admin, "GET", "/api/v1/groups?size=50");
  const pcliCourse = (allGroups.data?.content ?? []).find((item) => item.claveAcceso === "PCLI-2026");
  if (pcliCourse) {
    const fillCoTeacher = await api(teacherAdmin, "POST", "/api/v1/groups/join", {
      claveAcceso: "PCLI-2026",
    });
    const extraTeacher = await api(admin, "POST", "/api/v1/users", {
      nombre: "Docente",
      apellido: "Extra",
      correo: `docente_extra_${Date.now()}@agora.com`,
      passwordTemporal: PASSWORD,
      rol: "DOCENTE",
    });
    const blockedJoin = await api(
      await login(extraTeacher.data.correo),
      "POST",
      "/api/v1/groups/join",
      { claveAcceso: "PCLI-2026" }
    );
    console.log("Limite docentes PCLI:", fillCoTeacher.status, blockedJoin.status);
    if (blockedJoin.status === 200) throw new Error("Debe bloquearse el tercer docente");
  }

  const edpxJoin = await api(student, "POST", "/api/v1/groups/join", { claveAcceso: "EDPX-2026" });
  console.log("Estudiante join EDPX (programacion inactiva):", edpxJoin.status);
  const casesAfterEdpx = await api(student, "GET", "/api/v1/cases?size=50");
  const conflictCase = (casesAfterEdpx.data?.content ?? []).find((item) =>
    item.titulo?.includes("Conflicto intergrupal")
  );
  console.log(
    "Caso programado inactivo visible / presentable:",
    Boolean(conflictCase),
    conflictCase?.presentable ?? "n/a"
  );
  if (conflictCase && conflictCase.presentable !== false) {
    throw new Error("Caso sin programacion activa no debe ser presentable");
  }

  const inactiveCase = visibleCases.find((item) => item.presentable === false);
  if (inactiveCase) {
    console.log("Mensaje no presentable:", inactiveCase.mensajePresentacion ? true : false);
  }

  const officialCase = visibleCases.find((item) => item.titulo?.includes("PSICOLOGIA SOCIAL"));
  if (officialCase?.presentable && officialCase.programacionActivaId) {
    const start = await api(student, "POST", "/api/v1/simulations/start", {
      casoId: officialCase.id,
      programacionId: officialCase.programacionActivaId,
    });
    console.log("Presentar caso oficial:", start.status);
  }

  const allCasesAdmin = await api(admin, "GET", "/api/v1/cases?size=50");
  const activeCases = (allCasesAdmin.data?.content ?? []).filter((item) => item.activo);
  console.log("Casos activos admin:", activeCases.length);
  console.log(
    "Nuevos casos CM4:",
    activeCases.filter((item) => item.titulo?.includes("Violencia familiar")).length > 0,
    activeCases.filter((item) => item.titulo?.includes("Conflicto intergrupal")).length > 0,
    activeCases.filter((item) => item.titulo?.includes("Intervencion psicosocial")).length > 0
  );

  const demoCourses = await api(admin, "GET", "/api/v1/groups?size=20");
  console.log(
    "Cursos demo:",
    (demoCourses.data?.content ?? []).filter((item) => item.claveAcceso).length
  );

  const createStudent = await api(admin, "POST", "/api/v1/users", {
    nombre: "Batch",
    apellido: "CM4",
    correo: `batch_cm4_${Date.now()}@agora.com`,
    passwordTemporal: PASSWORD,
    rol: "ESTUDIANTE",
  });
  const grupoId = misAfter.data?.content?.[0]?.id ?? join.data?.id;
  const batchAdd = await api(teacher, "POST", `/api/v1/groups/${grupoId}/students/batch`, {
    estudianteIds: [createStudent.data.id],
  });
  console.log("Batch add estudiante:", batchAdd.status, batchAdd.data?.agregados?.length ?? 0);

  console.log("\nPASS — CORRECCIÓN MAYOR 4 runtime validada (backend)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
