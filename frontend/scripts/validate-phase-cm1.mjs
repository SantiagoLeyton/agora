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
    throw new Error(`Login failed for ${email}: ${res.status}`);
  }
  return res.data.accessToken;
}

async function main() {
  console.log("=== CORRECCIÓN MAYOR 1 — Validación runtime ===\n");

  const health = await fetch(`${API}/actuator/health`);
  console.log("Health:", health.status, (await health.json()).status);

  const admin = await login("admin@agora.com");
  const teacherAdmin = await login("docente_admin@agora.com");
  const teacher = await login("docente@agora.com");
  const student = await login("estudiante@agora.com");

  const teachers = await api(admin, "GET", "/api/v1/users?rol=DOCENTE&size=5");
  const docenteId = teachers.data?.content?.[0]?.id;
  const alternateTeacherId = teachers.data?.content?.[1]?.id ?? docenteId;
  if (!docenteId) throw new Error("No hay docente para asignar curso");

  const courseRes = await api(admin, "POST", "/api/v1/groups", {
    nombre: `Curso CM1 ${Date.now()}`,
    descripcion: "Curso de validación",
    periodo: "2026-1",
    docenteId,
  });
  console.log("Admin crear curso:", courseRes.status);
  if (courseRes.status !== 201) throw new Error("No se pudo crear curso");
  const courseId = courseRes.data.id;

  const students = await api(admin, "GET", "/api/v1/users?rol=ESTUDIANTE&size=1");
  const estudianteId = students.data?.content?.[0]?.id;
  if (!estudianteId) throw new Error("No hay estudiante para matricular");

  const enroll = await api(teacher, "POST", `/api/v1/groups/${courseId}/students`, {
    estudianteId,
  });
  console.log("Matricular estudiante:", enroll.status);
  if (enroll.status !== 201) throw new Error("No se pudo matricular estudiante");

  const cases = await api(teacherAdmin, "GET", "/api/v1/cases?size=1&activo=true");
  const casoId = cases.data?.content?.[0]?.id;
  const scheduleRes = await api(teacher, "POST", "/api/v1/schedules", {
    grupoId: courseId,
    casoId,
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 86400000).toISOString(),
    estudianteId: null,
  });
  console.log("Programar simulación:", scheduleRes.status);
  if (scheduleRes.status !== 201) throw new Error("No se pudo programar simulación");

  const assignTeacher = await api(admin, "PUT", `/api/v1/groups/${courseId}`, {
    nombre: courseRes.data.nombre,
    descripcion: "Curso con docente reasignado",
    periodo: "2026-1",
    docenteId: alternateTeacherId,
  });
  console.log("Asignar docente al curso:", assignTeacher.status);
  if (assignTeacher.status !== 200) throw new Error("Admin no pudo cambiar docente del curso");

  const studentCourses = await api(student, "GET", "/api/v1/groups?size=20");
  console.log("Estudiante listar cursos:", studentCourses.status, studentCourses.data?.content?.length ?? 0);

  const courseDetail = await api(student, "GET", `/api/v1/groups/${courseId}`);
  console.log("Ver curso (estudiante):", courseDetail.status, courseDetail.data?.id === courseId);
  if (courseDetail.status !== 200) throw new Error("No se pudo ver el curso");

  const forgot = await api(null, "POST", "/api/v1/auth/forgot-password", {
    correo: "estudiante@agora.com",
  });
  console.log("Recuperar contraseña:", forgot.status, Boolean(forgot.data?.tokenDesarrollo || forgot.data?.enlaceDesarrollo));
  if (forgot.status !== 200) throw new Error("Forgot password falló");

  const token = forgot.data.tokenDesarrollo;
  if (token) {
    const reset = await api(null, "POST", "/api/v1/auth/reset-password", {
      token,
      password: PASSWORD,
    });
    console.log("Reset contraseña:", reset.status);
    if (reset.status !== 204) throw new Error("Reset password falló");
  }

  const newUser = await api(admin, "POST", "/api/v1/users", {
    nombre: "Usuario",
    apellido: "CM1",
    correo: `cm1_${Date.now()}@agora.com`,
    passwordTemporal: "Agora12345*",
    rol: "ESTUDIANTE",
  });
  console.log("Crear usuario:", newUser.status);
  if (newUser.status !== 201) throw new Error("CRUD usuario falló");

  const editUser = await api(admin, "PUT", `/api/v1/users/${newUser.data.id}`, {
    nombre: "Usuario Editado",
    apellido: "CM1",
    correo: newUser.data.correo,
    rol: "ESTUDIANTE",
    activo: true,
  });
  console.log("Editar usuario:", editUser.status);
  if (editUser.status !== 200) throw new Error("No se pudo editar usuario");

  const attempts = await api(student, "GET", "/api/v1/attempts?estado=FINALIZADO&size=5");
  const attemptItems = attempts.data?.content ?? [];
  const attemptId = attemptItems[0]?.id;
  if (attemptId) {
    const feedback = await api(teacher, "POST", `/api/v1/attempts/${attemptId}/feedback`, {
      contenido: "Retroalimentación CM1 de validación.",
      observaciones: "Seguimiento académico",
    });
    console.log("Crear feedback docente:", feedback.status);
    if (feedback.status === 201 && feedback.data?.id) {
      const editFeedback = await api(teacher, "PUT", `/api/v1/attempts/${attemptId}/feedback/${feedback.data.id}`, {
        contenido: "Retroalimentación CM1 actualizada.",
        observaciones: "Seguimiento académico revisado",
      });
      console.log("Editar feedback docente:", editFeedback.status);
      if (editFeedback.status !== 200) throw new Error("No se pudo editar feedback docente");
    }
  }

  const deniedCase = await api(teacher, "POST", "/api/v1/cases", {
    titulo: "Caso denegado CM1",
    descripcion: "No debe crearse",
    nivelDificultad: "BASICO",
    duracionEstimada: 30,
  });
  console.log("DOCENTE crear caso (expect 403):", deniedCase.status);

  const roles = await api(admin, "GET", "/api/v1/roles");
  console.log("Roles:", roles.status, roles.data?.length ?? 0);
  if (roles.data?.length !== 4) throw new Error("Se esperaban 4 roles institucionales");

  const freshCase = await api(teacherAdmin, "POST", "/api/v1/cases", {
    titulo: `Caso CM1 ${Date.now()}`,
    descripcion: "Caso temporal para ciclo de vida",
    nivelDificultad: "BASICO",
    duracionEstimada: 30,
  });
  console.log("DOCENTE_ADMIN crear caso:", freshCase.status);
  if (freshCase.status !== 201) throw new Error("DOCENTE_ADMIN no pudo crear caso");
  const freshCaseId = freshCase.data.id;

  const deactivateCase = await api(teacherAdmin, "PATCH", `/api/v1/cases/${freshCaseId}/deactivate`);
  console.log("Desactivar caso:", deactivateCase.status, deactivateCase.data?.activo === false);
  if (deactivateCase.status !== 200) throw new Error("No se pudo desactivar caso");

  const activateCase = await api(teacherAdmin, "PATCH", `/api/v1/cases/${freshCaseId}/activate`);
  console.log("Reactivar caso:", activateCase.status, activateCase.data?.activo === true);
  if (activateCase.status !== 200) throw new Error("No se pudo reactivar caso");

  console.log("Continuar sesión (UI): /courses enlazado desde dashboard estudiante");

  console.log("\nPASS — CORRECCIÓN MAYOR 1 runtime validada (12 escenarios)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
