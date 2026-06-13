package com.agora.modules.academic.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.agora.modules.academic.repository.GrupoDocenteRepository;
import com.agora.modules.academic.repository.GrupoEstudianteRepository;
import com.agora.modules.academic.repository.GrupoRepository;
import com.agora.modules.academic.repository.ProgramacionRepository;
import com.agora.modules.auth.repository.AuditoriaRepository;
import com.agora.modules.auth.repository.RefreshTokenRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.RolRepository;
import com.agora.modules.user.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AcademicControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired RolRepository rolRepository;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired AuditoriaRepository auditoriaRepository;
    @Autowired GrupoRepository grupoRepository;
    @Autowired GrupoEstudianteRepository grupoEstudianteRepository;
    @Autowired GrupoDocenteRepository grupoDocenteRepository;
    @Autowired ProgramacionRepository programacionRepository;

    private Usuario estudiante;

    @BeforeEach
    void setUp() {
        programacionRepository.deleteAll();
        grupoDocenteRepository.deleteAll();
        grupoEstudianteRepository.deleteAll();
        grupoRepository.deleteAll();
        auditoriaRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();
        Rol admin = rolRepository.save(new Rol("ADMINISTRADOR", "Administrador"));
        Rol docente = rolRepository.save(new Rol("DOCENTE", "Docente"));
        Rol estudianteRol = rolRepository.save(new Rol("ESTUDIANTE", "Estudiante"));
        usuarioRepository.save(new Usuario(admin, "Admin", "Agora", "admin@agora.com",
                passwordEncoder.encode("Agora12345*")));
        usuarioRepository.save(new Usuario(docente, "Docente", "Uno", "docente@agora.com",
                passwordEncoder.encode("Agora12345*")));
        usuarioRepository.save(new Usuario(docente, "Docente", "Dos", "docente2@agora.com",
                passwordEncoder.encode("Agora12345*")));
        estudiante = usuarioRepository.save(new Usuario(estudianteRol, "Estudiante", "Agora",
                "estudiante@agora.com", passwordEncoder.encode("Agora12345*")));
    }

    @Test
    void teacherManagesOwnGroupsStudentsAndSchedules() throws Exception {
        String teacherToken = login("docente@agora.com");
        Long groupId = createGroup(teacherToken);

        mockMvc.perform(post("/api/v1/groups/" + groupId + "/students")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estudianteId\":" + estudiante.getId() + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.correo").value("estudiante@agora.com"));

        mockMvc.perform(put("/api/v1/groups/" + groupId)
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Grupo Social Actualizado",
                                  "descripcion": "Practica",
                                  "periodo": "2026-1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Grupo Social Actualizado"));

        mockMvc.perform(patch("/api/v1/groups/" + groupId + "/deactivate")
                        .header("Authorization", bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false));

        Long scheduleId = createSchedule(teacherToken, groupId);
        mockMvc.perform(put("/api/v1/schedules/" + scheduleId)
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "grupoId": %d,
                                  "casoId": null,
                                  "fechaInicio": "2026-06-05T10:00:00Z",
                                  "fechaFin": "2026-06-05T13:00:00Z",
                                  "activo": true
                                }
                                """.formatted(groupId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fechaFin").value("2026-06-05T13:00:00Z"));

        mockMvc.perform(delete("/api/v1/groups/" + groupId + "/students?estudianteId=" + estudiante.getId())
                        .header("Authorization", bearer(teacherToken)))
                .andExpect(status().isNoContent());

        assertThat(auditoriaRepository.findAll()).anyMatch(audit -> "GROUP_CREATED".equals(audit.getAccion()));
        assertThat(auditoriaRepository.findAll()).anyMatch(audit -> "SCHEDULE_UPDATED".equals(audit.getAccion()));
    }

    @Test
    void protectsAcademicEndpointsByRoleAndOwnership() throws Exception {
        String teacherToken = login("docente@agora.com");
        String otherTeacherToken = login("docente2@agora.com");
        String adminToken = login("admin@agora.com");
        String studentToken = login("estudiante@agora.com");
        Long groupId = createGroup(teacherToken);

        mockMvc.perform(post("/api/v1/groups")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Admin\",\"periodo\":\"2026-1\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Debe asignar un docente al curso"));

        mockMvc.perform(post("/api/v1/groups")
                        .header("Authorization", bearer(studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Estudiante\",\"periodo\":\"2026-1\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/v1/groups/" + groupId)
                        .header("Authorization", bearer(otherTeacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Ajeno",
                                  "descripcion": "No permitido",
                                  "periodo": "2026-1"
                                }
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/groups").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(groupId));

        mockMvc.perform(get("/api/v1/groups").header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    void validatesStudentRoleDuplicateEnrollmentAndScheduleDates() throws Exception {
        String teacherToken = login("docente@agora.com");
        Long groupId = createGroup(teacherToken);
        Long teacherUserId = usuarioRepository.findByCorreoIgnoreCase("docente2@agora.com").orElseThrow().getId();

        mockMvc.perform(post("/api/v1/groups/" + groupId + "/students")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estudianteId\":" + teacherUserId + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El usuario no tiene rol ESTUDIANTE"));

        mockMvc.perform(post("/api/v1/groups/" + groupId + "/students")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estudianteId\":" + estudiante.getId() + "}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/groups/" + groupId + "/students")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estudianteId\":" + estudiante.getId() + "}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El estudiante ya pertenece al grupo"));

        mockMvc.perform(post("/api/v1/schedules")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "grupoId": %d,
                                  "casoId": null,
                                  "fechaInicio": "2026-06-05T12:00:00Z",
                                  "fechaFin": "2026-06-05T10:00:00Z"
                                }
                                """.formatted(groupId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La fecha de inicio debe ser anterior a la fecha de fin"));
    }

    @Test
    void studentCanReadOwnGroupsAndSchedules() throws Exception {
        String teacherToken = login("docente@agora.com");
        String studentToken = login("estudiante@agora.com");
        Long groupId = createGroup(teacherToken);
        mockMvc.perform(post("/api/v1/groups/" + groupId + "/students")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estudianteId\":" + estudiante.getId() + "}"))
                .andExpect(status().isCreated());
        Long scheduleId = createSchedule(teacherToken, groupId);

        mockMvc.perform(get("/api/v1/groups/" + groupId).header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(groupId));

        mockMvc.perform(get("/api/v1/groups/" + groupId + "/students").header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].correo").value("estudiante@agora.com"));

        mockMvc.perform(get("/api/v1/schedules/" + scheduleId).header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(scheduleId));
    }

    private Long createGroup(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/groups")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Grupo Social",
                                  "descripcion": "Practica",
                                  "periodo": "2026-1"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private Long createSchedule(String token, Long groupId) throws Exception {
        String response = mockMvc.perform(post("/api/v1/schedules")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "grupoId": %d,
                                  "casoId": null,
                                  "fechaInicio": "2026-06-05T10:00:00Z",
                                  "fechaFin": "2026-06-05T12:00:00Z"
                                }
                                """.formatted(groupId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private String login(String correo) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"" + correo + "\",\"password\":\"Agora12345*\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode login = objectMapper.readTree(response);
        return login.get("accessToken").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
