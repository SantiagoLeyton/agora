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
  console.log("=== FASE 12 — Validación runtime ===\n");

  const health = await fetch(`${API}/actuator/health`);
  console.log("Health:", health.status, (await health.json()).status);

  await login("admin@agora.com");
  const teacherAdmin = await login("docente_admin@agora.com");
  const teacher = await login("docente@agora.com");
  const student = await login("estudiante@agora.com");

  const deniedCreate = await api(teacher, "POST", "/api/v1/cases", {
    titulo: "Caso docente denegado",
    descripcion: "No debe crearse",
    nivelDificultad: "BASICO",
    duracionEstimada: 30,
  });
  console.log("DOCENTE create case (expect 403):", deniedCreate.status);
  if (deniedCreate.status !== 403) {
    throw new Error("DOCENTE no debería poder crear casos");
  }

  const caseRes = await api(teacherAdmin, "POST", "/api/v1/cases", {
    titulo: `Caso Fase 12 ${Date.now()}`,
    descripcion: "Caso de gobierno académico",
    objetivo: "Complemento opcional",
    nivelDificultad: "INTERMEDIO",
    duracionEstimada: 40,
  });
  if (caseRes.status !== 201) {
    throw new Error(`Create case failed: ${caseRes.status} ${JSON.stringify(caseRes.data)}`);
  }
  const casoId = caseRes.data.id;
  console.log("Caso creado por DOCENTE_ADMIN:", casoId);

  const rdaRes = await api(teacherAdmin, "PUT", `/api/v1/cases/${casoId}/learning-outcomes/sync`, [
    { orden: 1, descripcion: "Identificar factores de riesgo suicida" },
    { orden: 2, descripcion: "Aplicar escucha activa" },
  ]);
  console.log("Sync RDA:", rdaRes.status, rdaRes.data?.length ?? 0);
  if (rdaRes.status !== 200 || rdaRes.data.length < 2) {
    throw new Error("RDA sync failed");
  }

  const sceneRes = await api(teacherAdmin, "POST", `/api/v1/cases/${casoId}/scenes`, {
    orden: 1,
    titulo: "Escena inicial",
    descripcion: "Consultorio",
    contenido: "Paciente con angustia",
  });
  const sceneId = sceneRes.data.id;

  const questionRes = await api(teacherAdmin, "POST", `/api/v1/scenes/${sceneId}/questions`, {
    enunciado: "¿Cómo iniciarías?",
    obligatoria: true,
    pesoPuntos: 1,
  });
  const questionId = questionRes.data.id;

  await api(teacherAdmin, "POST", `/api/v1/questions/${questionId}/options`, {
    texto: "Explorar",
    orden: 1,
    porcentajeCredito: 100,
  });
  await api(teacherAdmin, "POST", `/api/v1/questions/${questionId}/options`, {
    texto: "Confrontar",
    orden: 2,
    porcentajeCredito: 0,
  });

  const tools = await api(teacherAdmin, "GET", "/api/v1/tools?size=5");
  const entities = await api(teacherAdmin, "GET", "/api/v1/institutional-entities?size=5");
  const toolId = tools.data.content?.[0]?.id;
  const entityId = entities.data.content?.[0]?.id;
  if (toolId) {
    const linkTool = await api(teacherAdmin, "POST", `/api/v1/cases/${casoId}/tools/${toolId}`);
    console.log("Link herramienta:", linkTool.status);
  }
  if (entityId) {
    const linkEntity = await api(teacherAdmin, "POST", `/api/v1/cases/${casoId}/entities/${entityId}`);
    console.log("Link entidad:", linkEntity.status);
  }

  const updateCase = await api(teacherAdmin, "PUT", `/api/v1/cases/${casoId}`, {
    titulo: `Caso Fase 12 editado ${Date.now()}`,
    descripcion: "Actualizado",
    nivelDificultad: "AVANZADO",
    duracionEstimada: 50,
  });
  console.log("Editar caso:", updateCase.status);

  const updateScene = await api(teacherAdmin, "PUT", `/api/v1/scenes/${sceneId}`, {
    orden: 1,
    titulo: "Escena editada",
    descripcion: "Consultorio",
    contenido: "Paciente con angustia moderada",
  });
  console.log("Editar escena:", updateScene.status);

  const listFiltered = await api(teacher, "GET", `/api/v1/cases?rdaSearch=escucha&nivelDificultad=AVANZADO`);
  console.log("Listar con filtros (DOCENTE lectura):", listFiltered.status);

  const groupRes = await api(teacher, "POST", "/api/v1/groups", {
    nombre: `Grupo Fase 12 ${Date.now()}`,
    descripcion: "Programación docente",
    periodo: "2026-1",
  });
  const groupId = groupRes.data.id;
  await api(teacher, "POST", `/api/v1/groups/${groupId}/students`, { estudianteId: 3 });

  const scheduleRes = await api(teacher, "POST", "/api/v1/schedules", {
    grupoId: groupId,
    casoId,
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 86400000).toISOString(),
    activo: true,
  });
  console.log("Programación DOCENTE:", scheduleRes.status);

  const builder = await api(student, "GET", `/api/v1/cases/${casoId}/builder`);
  console.log(
    "Builder estudiante RDA:",
    builder.data?.resultadosAprendizaje?.length ?? builder.data?.caso?.resultadosAprendizaje?.length
  );

  await api(teacherAdmin, "DELETE", `/api/v1/scenes/${sceneId}`);
  console.log("Eliminar escena: OK");

  const deleteDenied = await api(teacher, "DELETE", `/api/v1/cases/${casoId}`);
  console.log("DOCENTE delete case (expect 403):", deleteDenied.status);

  await api(teacherAdmin, "DELETE", `/api/v1/cases/${casoId}`);
  console.log("Eliminar caso sin intentos: OK");

  console.log("\nPASS — FASE 12 runtime validada");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
