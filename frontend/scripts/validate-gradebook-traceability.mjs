#!/usr/bin/env node

const API = process.env.API_URL ?? "http://localhost:8081";
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
  console.log("=== BUG GRADEBOOK TRAZABILIDAD — Validación runtime ===\n");

  const teacher = await login("docente@agora.com");
  const admin = await login("admin@agora.com");
  const student = await login("estudiante@agora.com");

  const cases = await api(student, "GET", "/api/v1/cases?size=50");
  const academicCase = (cases.data?.content ?? []).find(
    (item) => item.presentable === true && item.programacionActivaId
  );
  if (!academicCase) throw new Error("No hay caso académico presentable para validar");

  const startWithoutParam = await api(student, "POST", "/api/v1/simulations/start", {
    casoId: academicCase.id,
  });
  if (startWithoutParam.status !== 201) {
    throw new Error(`Start académico sin programacionId falló: ${startWithoutParam.status}`);
  }
  const attemptId = startWithoutParam.data.intentoId;
  console.log("Start sin query param, intento:", attemptId);

  const detail = await api(student, "GET", `/api/v1/simulations/${attemptId}`);
  const programacionId = detail.data?.intento?.programacionId;
  console.log("programacion_id persistido:", programacionId);
  if (!programacionId) throw new Error("programacion_id sigue NULL tras auto-resolución");

  const simulation = await api(student, "GET", `/api/v1/simulations/${attemptId}`);
  const escenaActual = simulation.data?.escenaActual;
  const builder = await api(student, "GET", `/api/v1/cases/${academicCase.id}/builder`);
  const scene =
    builder.data?.escenas?.find((item) => item.escena?.id === escenaActual?.id) ??
    builder.data?.escenas?.[0];
  for (const item of scene?.preguntas ?? []) {
    const pregunta = item.pregunta ?? item;
    const opcion = (item.opciones ?? []).map((entry) => entry.opcion ?? entry)[0];
    if (!pregunta?.id || !opcion?.id) continue;
    const answer = await api(student, "POST", `/api/v1/simulations/${attemptId}/answer`, {
      preguntaId: pregunta.id,
      opcionId: opcion.id,
    });
    if (answer.status !== 200) {
      throw new Error(`Answer failed: ${answer.status} ${JSON.stringify(answer.data)}`);
    }
  }

  const finish = await api(student, "POST", `/api/v1/simulations/${attemptId}/finish`);
  if (finish.status !== 200) {
    throw new Error(`Finish failed: ${finish.status} ${JSON.stringify(finish.data)}`);
  }

  const summary = await api(student, "GET", `/api/v1/attempts/${attemptId}/summary`);
  console.log(
    "Finish:",
    summary.data?.intento?.estado,
    "nota:",
    summary.data?.intento?.notaFinal,
    "prog:",
    summary.data?.intento?.programacionId
  );
  if (summary.data?.intento?.estado !== "FINALIZADO") {
    throw new Error("Intento no quedó FINALIZADO");
  }
  if (summary.data?.intento?.notaFinal == null) {
    throw new Error("Intento sin nota_final tras finalizar");
  }

  const teacherGradebook = await api(teacher, "GET", "/api/v1/gradebook/entries?size=50");
  const adminGradebook = await api(admin, "GET", "/api/v1/gradebook/entries?size=50");
  const teacherRow = (teacherGradebook.data?.content ?? []).find((row) => row.attemptId === attemptId);
  const adminRow = (adminGradebook.data?.content ?? []).find((row) => row.attemptId === attemptId);

  console.log("Docente ve intento:", Boolean(teacherRow), teacherRow?.notaFinal ?? "n/a");
  console.log("Admin ve intento:", Boolean(adminRow), adminRow?.notaFinal ?? "n/a");
  if (!teacherRow) throw new Error("Docente no ve el intento en Calificaciones");
  if (teacherRow.notaFinal == null) throw new Error("Docente ve intento pero sin nota en gradebook");

  const freeCase = (cases.data?.content ?? []).find((item) => item.presentable === false);
  if (freeCase) {
    const freeStart = await api(student, "POST", "/api/v1/simulations/start", {
      casoId: freeCase.id,
    });
    console.log("Modo libre start:", freeStart.status, freeStart.data?.intentoId);
    if (freeStart.status !== 201) throw new Error("Modo libre no pudo iniciar");
    const freeDetail = await api(student, "GET", `/api/v1/simulations/${freeStart.data.intentoId}`);
    console.log("Modo libre programacion_id:", freeDetail.data?.intento?.programacionId ?? "null");
  }

  console.log("\nPASS — BUG GRADEBOOK TRAZABILIDAD runtime validada");
}

main().catch((error) => {
  console.error("\nFAIL —", error.message);
  process.exit(1);
});
