#!/usr/bin/env node
/**
 * Runtime validation for Phase 8 — hierarchical case builder.
 * Creates simple + medium cases via API and verifies builder + simulation flow.
 */

const API = process.env.API_URL ?? "http://localhost:8080";
const PASSWORD = "Agora12345*";

async function login(email) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  const data = await res.json();
  return data.accessToken;
}

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function createBundle(token, label, sceneCount, questionsPerScene, optionsPerQuestion) {
  const caso = await api(token, "POST", "/api/v1/cases", {
    titulo: `Fase 8 — ${label}`,
    descripcion: `Caso de validación ${label}`,
    objetivo: "Validar builder jerárquico",
    nivelDificultad: "INTERMEDIO",
    duracionEstimada: 45,
  });

  for (let s = 0; s < sceneCount; s += 1) {
    const escena = await api(token, "POST", `/api/v1/cases/${caso.id}/scenes`, {
      orden: s + 1,
      titulo: `Escena ${s + 1}`,
      descripcion: `Escenario ${s + 1}`,
      contenido: `Relato del paciente en escena ${s + 1}.`,
      activo: true,
    });

    for (let q = 0; q < questionsPerScene; q += 1) {
      const pregunta = await api(token, "POST", `/api/v1/scenes/${escena.id}/questions`, {
        enunciado: `Pregunta ${q + 1} de escena ${s + 1}`,
        obligatoria: true,
        activo: true,
      });

      for (let o = 0; o < optionsPerQuestion; o += 1) {
        await api(token, "POST", `/api/v1/questions/${pregunta.id}/options`, {
          texto: `Opción ${String.fromCharCode(65 + o)} — escena ${s + 1} pregunta ${q + 1}`,
          descripcion: `Descripción opción ${o + 1}`,
          orden: o + 1,
          activo: true,
        });
      }
    }
  }

  const builder = await api(token, "GET", `/api/v1/cases/${caso.id}/builder`);
  return { caso, builder };
}

function countBuilder(builder) {
  const scenes = builder.escenas.length;
  const questions = builder.escenas.reduce((n, s) => n + s.preguntas.length, 0);
  const options = builder.escenas.reduce(
    (n, s) => n + s.preguntas.reduce((m, p) => m + p.opciones.length, 0),
    0
  );
  return { scenes, questions, options };
}

async function getAttemptSummary(studentToken, attemptId) {
  try {
    return await api(studentToken, "GET", `/api/v1/attempts/${attemptId}/summary`);
  } catch {
    return null;
  }
}

function firstPendingQuestion(sceneBundle, answeredIds) {
  return sceneBundle.preguntas.find(
    (item) => item.pregunta.activo && !answeredIds.has(item.pregunta.id)
  );
}

async function simulatePartial(studentToken, caseId, answerCount) {
  const start = await api(studentToken, "POST", "/api/v1/simulations/start", {
    casoId: caseId,
    programacionId: null,
  });
  const attemptId = start.intentoId ?? start.id ?? start;

  let answersSubmitted = 0;
  for (let i = 0; i < answerCount; i += 1) {
    const sim = await api(studentToken, "GET", `/api/v1/simulations/${attemptId}`);
    if (!sim.escenaActual) break;

    const summary = await getAttemptSummary(studentToken, attemptId);
    const answeredIds = new Set(
      (summary?.respuestas ?? []).map((answer) => answer.preguntaId)
    );

    const builder = await api(studentToken, "GET", `/api/v1/cases/${caseId}/builder`);
    const scene = builder.escenas.find((s) => s.escena.id === sim.escenaActual.id);
    const question = scene ? firstPendingQuestion(scene, answeredIds) : null;
    const option = question?.opciones.find((item) => item.activo);
    if (!question || !option) break;

    await api(studentToken, "POST", `/api/v1/simulations/${attemptId}/answer`, {
      preguntaId: question.pregunta.id,
      opcionId: option.id,
    });
    answersSubmitted += 1;
  }

  const after = await api(studentToken, "GET", `/api/v1/simulations/${attemptId}`);
  return {
    attemptId,
    answersSubmitted,
    stillHasScene: Boolean(after.escenaActual),
    estado: after.intento?.estado,
  };
}

async function main() {
  console.log("=== Fase 8 — Validación runtime Case Builder ===\n");

  const teacherToken = await login("docente@agora.com");
  const studentToken = await login("estudiante@agora.com");

  const simple = await createBundle(teacherToken, "Caso simple", 2, 2, 3);
  const simpleCounts = countBuilder(simple.builder);
  console.log("Caso simple creado:", simple.caso.id);
  console.log("  Builder:", simpleCounts);

  const medium = await createBundle(teacherToken, "Caso mediano", 3, 3, 3);
  const mediumCounts = countBuilder(medium.builder);
  console.log("Caso mediano creado:", medium.caso.id);
  console.log("  Builder:", mediumCounts);

  const sim = await simulatePartial(studentToken, simple.caso.id, 3);
  console.log("\nSimulación (caso simple, 3 respuestas intentadas):");
  console.log("  Respuestas enviadas:", sim.answersSubmitted);
  console.log("  Sigue con escena activa:", sim.stillHasScene);
  console.log("  Estado:", sim.estado);

  const okSimple =
    simpleCounts.scenes === 2 &&
    simpleCounts.questions === 4 &&
    simpleCounts.options === 12;
  const okMedium =
    mediumCounts.scenes === 3 &&
    mediumCounts.questions === 9 &&
    mediumCounts.options === 27;
  const okSim = sim.answersSubmitted >= 2 && sim.stillHasScene;

  console.log("\n--- Resultado ---");
  console.log("Builder simple OK:", okSimple);
  console.log("Builder mediano OK:", okMedium);
  console.log("Simulación no termina tras 1 respuesta OK:", okSim);

  if (!okSimple || !okMedium || !okSim) {
    process.exit(1);
  }

  console.log("\nFASE 8 RUNTIME VALIDATION: PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
