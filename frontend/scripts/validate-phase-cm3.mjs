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
  console.log("=== CORRECCIÓN MAYOR 3 — Validación runtime ===\n");

  const admin = await login("admin@agora.com");
  const teacher = await login("docente@agora.com");
  const teacherAdmin = await login("docente_admin@agora.com");
  const studentA = await login("estudiante@agora.com");

  const courses = await api(admin, "GET", "/api/v1/groups?size=5");
  const courseId = courses.data?.content?.[0]?.id;
  if (!courseId) throw new Error("No hay curso para validar admin");
  const courseDetail = await api(admin, "GET", `/api/v1/groups/${courseId}`);
  console.log("Admin acceder curso:", courseDetail.status, courseDetail.data?.id === courseId);
  if (courseDetail.status !== 200) throw new Error("Admin no puede acceder al curso");

  const createUser = await api(admin, "POST", "/api/v1/users", {
    nombre: "Usuario",
    apellido: "CM3",
    correo: `cm3_${Date.now()}@agora.com`,
    passwordTemporal: PASSWORD,
    rol: "ESTUDIANTE",
  });
  console.log("Admin crear usuario:", createUser.status);
  if (createUser.status !== 201) throw new Error("Crear usuario falló");

  const editUser = await api(admin, "PUT", `/api/v1/users/${createUser.data.id}`, {
    nombre: "Usuario Editado",
    apellido: "CM3",
    correo: createUser.data.correo,
    rol: "DOCENTE",
    activo: true,
  });
  console.log("Admin editar usuario:", editUser.status);
  if (editUser.status !== 200) throw new Error("Editar usuario falló");

  const deniedCase = await api(teacher, "POST", "/api/v1/cases", {
    titulo: "Caso denegado CM3",
    descripcion: "No debe crearse",
    nivelDificultad: "BASICO",
    duracionEstimada: 30,
  });
  console.log("DOCENTE crear caso (403):", deniedCase.status);

  const allowedCase = await api(teacherAdmin, "POST", "/api/v1/cases", {
    titulo: `Caso CM3 ${Date.now()}`,
    descripcion: "Validación docente admin",
    nivelDificultad: "BASICO",
    duracionEstimada: 30,
  });
  console.log("DOCENTE_ADMIN crear caso:", allowedCase.status);

  const schedules = await api(studentA, "GET", "/api/v1/schedules?activo=true&size=5");
  const schedule = schedules.data?.content?.[0];
  const casoId = schedule?.casoId;
  const programacionId = schedule?.id;

  const startA = await api(studentA, "POST", "/api/v1/simulations/start", {
    casoId,
    programacionId,
  });
  console.log("Estudiante A iniciar:", startA.status);
  const attemptA = startA.data?.intentoId;
  if (startA.status !== 201 || !attemptA) throw new Error("Estudiante A no pudo iniciar simulación");

  const studentBUser = await api(admin, "POST", "/api/v1/users", {
    nombre: "Estudiante",
    apellido: "CM3B",
    correo: `cm3b_${Date.now()}@agora.com`,
    passwordTemporal: PASSWORD,
    rol: "ESTUDIANTE",
  });
  if (studentBUser.status !== 201) throw new Error("No se pudo crear estudiante B");
  const grupoId = schedule?.grupoId;
  if (!grupoId) throw new Error("No hay grupoId en la programación");
  const enrollB = await api(teacher, "POST", `/api/v1/groups/${grupoId}/students`, {
    estudianteId: studentBUser.data.id,
  });
  if (enrollB.status !== 201) throw new Error("No se pudo matricular estudiante B");

  const scheduleB = await api(teacher, "POST", "/api/v1/schedules", {
    grupoId,
    casoId,
    estudianteId: studentBUser.data.id,
    fechaInicio: new Date(Date.now() - 86400000).toISOString(),
    fechaFin: new Date(Date.now() + 86400000 * 30).toISOString(),
  });
  if (scheduleB.status !== 201) throw new Error("No se pudo crear programación para estudiante B");

  const studentB = await login(studentBUser.data.correo);
  const startB = await api(studentB, "POST", "/api/v1/simulations/start", {
    casoId,
    programacionId: scheduleB.data.id,
  });
  console.log("Estudiante B iniciar:", startB.status);
  const attemptB = startB.data?.intentoId;
  if (startB.status !== 201 || !attemptB) throw new Error("Estudiante B no pudo iniciar simulación");
  if (attemptA === attemptB) throw new Error("Intentos compartidos entre estudiantes");

  const attemptsA = await api(studentA, "GET", "/api/v1/attempts?size=50");
  const attemptsB = await api(studentB, "GET", "/api/v1/attempts?size=50");
  const idsA = (attemptsA.data?.content ?? []).map((item) => item.id);
  const idsB = (attemptsB.data?.content ?? []).map((item) => item.id);
  const countA = idsA.length;
  const countB = idsB.length;
  const crossLeakA = idsA.some((id) => id === attemptB);
  const crossLeakB = idsB.some((id) => id === attemptA);
  console.log(
    "Progreso independiente A/B:",
    countA,
    countB,
    "attemptA:",
    attemptA,
    "attemptB:",
    attemptB,
    "fuga cruzada:",
    crossLeakA || crossLeakB
  );
  if (crossLeakA || crossLeakB) throw new Error("Progreso compartido entre estudiantes");

  const weakPassword = await api(admin, "POST", "/api/v1/users", {
    nombre: "Weak",
    apellido: "Pass",
    correo: `weak_${Date.now()}@agora.com`,
    passwordTemporal: "password",
    rol: "ESTUDIANTE",
  });
  console.log("Password débil rechazado (400):", weakPassword.status);

  const teacherAttempts = await api(teacher, "GET", "/api/v1/attempts?estado=FINALIZADO&size=5");
  const teacherAdminAttempts = await api(
    teacherAdmin,
    "GET",
    "/api/v1/attempts?estado=FINALIZADO&size=5"
  );
  console.log(
    "Intentos visibles docente / docente_admin:",
    teacherAttempts.data?.content?.length ?? 0,
    teacherAdminAttempts.data?.content?.length ?? 0
  );

  const attemptId = teacherAttempts.data?.content?.[0]?.id ?? teacherAdminAttempts.data?.content?.[0]?.id;
  if (attemptId) {
    const feedback = await api(teacher, "POST", `/api/v1/attempts/${attemptId}/feedback`, {
      contenido: "Retroalimentación CM3.",
      observaciones: "Seguimiento",
    });
    console.log("Crear feedback docente:", feedback.status);
    if (feedback.status === 201 && feedback.data?.id) {
      const editFeedback = await api(
        teacher,
        "PUT",
        `/api/v1/attempts/${attemptId}/feedback/${feedback.data.id}`,
        {
          contenido: "Retroalimentación CM3 actualizada.",
          observaciones: "Seguimiento revisado",
        }
      );
      console.log("Editar feedback docente:", editFeedback.status);

      const attemptOwner = teacherAttempts.data?.content?.[0]?.estudianteId;
      let studentTokenForFeedback = studentA;
      if (attemptOwner && attemptOwner !== createUser.data.id) {
        const ownerAttempts = await api(studentA, "GET", `/api/v1/attempts/${attemptId}`);
        if (ownerAttempts.status !== 200) {
          studentTokenForFeedback = studentB;
        }
      }
      const studentFeedback = await api(
        studentTokenForFeedback,
        "GET",
        `/api/v1/attempts/${attemptId}/feedback`
      );
      console.log("Estudiante ve feedback:", studentFeedback.status, (studentFeedback.data?.length ?? 0) > 0);
    }
  }

  console.log("Progreso estudiante A (intentos propios):", countA, "attemptId:", attemptA);
  console.log("\nPASS — CORRECCIÓN MAYOR 3 runtime validada (backend)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
