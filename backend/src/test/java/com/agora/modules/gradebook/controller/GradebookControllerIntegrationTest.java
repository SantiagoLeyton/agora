package com.agora.modules.gradebook.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.GrupoEstudiante;
import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.academic.repository.GrupoEstudianteRepository;
import com.agora.modules.academic.repository.GrupoRepository;
import com.agora.modules.academic.repository.ProgramacionRepository;
import com.agora.modules.auth.repository.AuditoriaRepository;
import com.agora.modules.auth.repository.RefreshTokenRepository;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.Escena;
import com.agora.modules.case_management.domain.Opcion;
import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.repository.CasoRepository;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.OpcionRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.modules.simulation.domain.EstadoEmocional;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.simulation.repository.EstadoEmocionalRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.RolRepository;
import com.agora.modules.user.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class GradebookControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired RolRepository rolRepository;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired AuditoriaRepository auditoriaRepository;
    @Autowired CasoRepository casoRepository;
    @Autowired EscenaRepository escenaRepository;
    @Autowired PreguntaRepository preguntaRepository;
    @Autowired OpcionRepository opcionRepository;
    @Autowired GrupoRepository grupoRepository;
    @Autowired GrupoEstudianteRepository grupoEstudianteRepository;
    @Autowired ProgramacionRepository programacionRepository;
    @Autowired EstadoEmocionalRepository estadoEmocionalRepository;
    @Autowired BitacoraRepository bitacoraRepository;
    @Autowired RetroalimentacionRepository retroalimentacionRepository;
    @Autowired EstadoIntentoRepository estadoIntentoRepository;
    @Autowired RespuestaRepository respuestaRepository;
    @Autowired IntentoRepository intentoRepository;

    private Long caseId;
    private Long questionId;
    private Long optionId;
    private Long scheduleId;

    @BeforeEach
    void setUp() {
        retroalimentacionRepository.deleteAll();
        bitacoraRepository.deleteAll();
        estadoIntentoRepository.deleteAll();
        respuestaRepository.deleteAll();
        intentoRepository.deleteAll();
        estadoEmocionalRepository.deleteAll();
        opcionRepository.deleteAll();
        preguntaRepository.deleteAll();
        escenaRepository.deleteAll();
        casoRepository.deleteAll();
        grupoEstudianteRepository.deleteAll();
        programacionRepository.deleteAll();
        grupoRepository.deleteAll();
        auditoriaRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();

        Rol admin = rolRepository.save(new Rol("ADMINISTRADOR", "Administrador"));
        Rol teacherRole = rolRepository.save(new Rol("DOCENTE", "Docente"));
        Rol teacherAdminRole = rolRepository.save(new Rol("DOCENTE_ADMIN", "Docente administrador"));
        Rol studentRole = rolRepository.save(new Rol("ESTUDIANTE", "Estudiante"));
        usuarioRepository.save(new Usuario(admin, "Admin", "Agora", "admin@agora.com",
                passwordEncoder.encode("Agora12345*")));
        Usuario teacher = usuarioRepository.save(new Usuario(teacherRole, "Docente", "Agora", "docente@agora.com",
                passwordEncoder.encode("Agora12345*")));
        usuarioRepository.save(new Usuario(teacherAdminRole, "Docente", "Admin", "docente_admin@agora.com",
                passwordEncoder.encode("Agora12345*")));
        Usuario student = usuarioRepository.save(new Usuario(studentRole, "Estudiante", "Agora",
                "estudiante@agora.com", passwordEncoder.encode("Agora12345*")));

        Caso caso = casoRepository.save(new Caso("Caso gradebook", "Desc", "Obj", "BASICO", 30, null));
        Escena escena = escenaRepository.save(new Escena(caso, 1, "Escena", "Desc", "Contenido"));
        Pregunta pregunta = preguntaRepository.save(new Pregunta(escena, "Que haria?", true));
        Opcion opcion = opcionRepository.save(new Opcion(pregunta, "Acompanhar", "Desc", 1));
        Grupo grupo = grupoRepository.save(new Grupo(teacher, "Grupo CM5", "Desc", "2026-1", "CM5-1234"));
        grupoEstudianteRepository.save(new GrupoEstudiante(grupo, student));
        Programacion programacion = programacionRepository.save(new Programacion(grupo, teacher, caso.getId(), null,
                Instant.now(), Instant.now().plusSeconds(3600)));
        estadoEmocionalRepository.save(new EstadoEmocional("CONFIANZA", "Confianza", 0, 100, 50));
        caseId = caso.getId();
        questionId = pregunta.getId();
        optionId = opcion.getId();
        scheduleId = programacion.getId();
    }

    @Test
    void gradebookEndpointsEnforceStaffVisibilityAndExports() throws Exception {
        String studentToken = login("estudiante@agora.com");
        String teacherToken = login("docente@agora.com");
        String adminToken = login("admin@agora.com");

        Long attemptId = start(studentToken);
        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/answer")
                        .header("Authorization", bearer(studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"preguntaId\":" + questionId + ",\"opcionId\":" + optionId + "}"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/finish")
                        .header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/gradebook/entries").header("Authorization", bearer(studentToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/gradebook/entries").header("Authorization", bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].attemptId").value(attemptId))
                .andExpect(jsonPath("$.content[0].estado").value("Finalizado"));

        mockMvc.perform(get("/api/v1/gradebook/analytics").header("Authorization", bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.umbralAprobacion").value(3.0));

        mockMvc.perform(get("/api/v1/gradebook/entries/" + attemptId + "/detail")
                        .header("Authorization", bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entry.attemptId").value(attemptId))
                .andExpect(jsonPath("$.summary.intento.id").value(attemptId));

        mockMvc.perform(get("/api/v1/gradebook/export?format=csv").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/gradebook/export?format=excel").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk());
    }

    private Long start(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/simulations/start")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"casoId\":" + caseId + ",\"programacionId\":" + scheduleId + "}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("intentoId").asLong();
    }

    private String login(String correo) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"" + correo + "\",\"password\":\"Agora12345*\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode login = objectMapper.readTree(response);
        return login.get("accessToken").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
