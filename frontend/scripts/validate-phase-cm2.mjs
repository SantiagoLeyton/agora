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
  if (res.status !== 200) throw new Error(`Login failed: ${res.status}`);
  return res.data.accessToken;
}

async function main() {
  console.log("=== CORRECCIÓN MAYOR 2 — Validación runtime ===\n");

  const health = await fetch(`${API}/actuator/health`);
  console.log("Health:", health.status, (await health.json()).status);

  const student = await login("estudiante@agora.com");
  const teacherAdmin = await login("docente_admin@agora.com");

  const cases = await api(teacherAdmin, "GET", "/api/v1/cases?search=juego+social&size=5");
  const officialCase = cases.data?.content?.find((item) =>
    item.titulo?.includes("PSICOLOGIA SOCIAL")
  );
  console.log("Caso oficial integrado:", Boolean(officialCase), officialCase?.titulo ?? "—");
  if (!officialCase) throw new Error("Caso oficial no encontrado en BD");

  const schedules = await api(student, "GET", "/api/v1/schedules?activo=true&size=20");
  const schedule = schedules.data?.content?.find((item) => item.casoId === officialCase.id);
  const programacionId = schedule?.id ?? null;

  const start = await api(student, "POST", "/api/v1/simulations/start", {
    casoId: officialCase.id,
    programacionId,
  });
  console.log("Iniciar simulación caso oficial:", start.status);
  if (start.status !== 201) throw new Error("No se pudo iniciar simulación");
  const attemptId = start.data.intentoId;

  const simulation = await api(student, "GET", `/api/v1/simulations/${attemptId}`);
  const escena = simulation.data?.escenaActual;
  const builder = await api(student, "GET", `/api/v1/cases/${officialCase.id}/builder`);
  const scene = builder.data?.escenas?.find((item) => item.escena.id === escena?.id);
  const question = scene?.preguntas?.[0];
  const option = question?.opciones?.[0];
  if (!question || !option) throw new Error("Caso oficial sin preguntas/opciones");

  const answer = await api(student, "POST", `/api/v1/simulations/${attemptId}/answer`, {
    preguntaId: question.pregunta.id,
    opcionId: option.id,
  });
  console.log("Consecuencia inmediata:", answer.status, Boolean(answer.data?.consecuencia?.mensaje));
  console.log("Estados tras respuesta:", answer.data?.estados?.length ?? 0);
  if (!answer.data?.consecuencia) throw new Error("Respuesta sin consecuencia clínica");

  const hasEmotionalAxes = ["ANSIEDAD", "ESTRES", "CONFIANZA", "COOPERACION", "RESISTENCIA"].every(
    (name) => answer.data.estados.some((state) => state.nombre === name)
  );
  console.log("Radar emocional (5 ejes):", hasEmotionalAxes);
  if (!hasEmotionalAxes) throw new Error("Estados emocionales incompletos");

  // Responder preguntas restantes si las hay
  for (const sceneItem of builder.data.escenas ?? []) {
    for (const q of sceneItem.preguntas ?? []) {
      const opt = q.opciones?.[0];
      if (!opt) continue;
      await api(student, "POST", `/api/v1/simulations/${attemptId}/answer`, {
        preguntaId: q.pregunta.id,
        opcionId: opt.id,
      }).catch(() => null);
    }
  }

  const finish = await api(student, "POST", `/api/v1/simulations/${attemptId}/finish`);
  console.log("Finalizar simulación:", finish.status, finish.data?.intento?.estado);
  if (finish.status !== 200) throw new Error("No se pudo finalizar");

  const consequences = await api(student, "GET", `/api/v1/attempts/${attemptId}/consequences`);
  console.log("Consecuencias acumuladas:", consequences.status, consequences.data?.consecuencias?.length ?? 0);

  const analysis = await api(student, "GET", `/api/v1/attempts/${attemptId}/pedagogical-analysis`);
  console.log("Análisis pedagógico:", analysis.status);
  console.log("  - Clínica:", Boolean(analysis.data?.retroalimentacionClinica));
  console.log("  - Pedagógica:", Boolean(analysis.data?.retroalimentacionPedagogica));
  console.log("  - Recomendaciones:", analysis.data?.recomendaciones?.length ?? 0);
  console.log("  - RDA alcanzados:", analysis.data?.rdaAlcanzados?.length ?? 0);
  console.log("  - Nota:", analysis.data?.notaFinal ?? "sin nota");

  const ai = await api(student, "POST", `/api/v1/attempts/${attemptId}/ai/summary`, {});
  console.log("Síntesis IA:", ai.status, ai.data?.modeloUtilizado, "exitosa:", ai.data?.fueExitosa);
  if (ai.status !== 201) throw new Error(`Síntesis IA falló con status ${ai.status}`);
  const provider =
    ai.data?.fueExitosa && String(ai.data?.modeloUtilizado).toLowerCase().includes("llama")
      ? "IA real (Ollama)"
      : ai.data?.fueExitosa
        ? "Fallback mock"
        : "Fallback determinístico";
  console.log("Proveedor detectado:", provider);
  if (provider !== "IA real (Ollama)") {
    console.warn("ADVERTENCIA: Ollama no respondió; se usó fallback. Ver docs/OLLAMA_RUNBOOK.md");
  }

  console.log("\nPASS — CORRECCIÓN MAYOR 2 runtime validada");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
