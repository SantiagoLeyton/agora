package com.agora.modules.simulation.controller;

import static org.assertj.core.api.Assertions.assertThat;
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
import java.math.BigDecimal;
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
class SimulationProgramacionTraceabilityIntegrationTest {

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

    private Usuario teacher;
    private Usuario otherTeacher;
    private Usuario student;
    private Long caseId;
    private Long questionId;
    private Long optionId;
    private Long scheduleId;
    private Long otherScheduleId;

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

        Rol teacherRole = rolRepository.save(new Rol("DOCENTE", "Docente"));
        Rol studentRole = rolRepository.save(new Rol("ESTUDIANTE", "Estudiante"));
        teacher = usuarioRepository.save(new Usuario(teacherRole, "Docente", "Uno", "docente@agora.com",
                passwordEncoder.encode("Agora12345*")));
        otherTeacher = usuarioRepository.save(new Usuario(teacherRole, "Docente", "Dos", "docente2@agora.com",
                passwordEncoder.encode("Agora12345*")));
        student = usuarioRepository.save(new Usuario(studentRole, "Estudiante", "Agora", "estudiante@agora.com",
                passwordEncoder.encode("Agora12345*")));

        Caso caso = casoRepository.save(new Caso("Caso trazabilidad", "Desc", "Obj", "BASICO", 30, teacher));
        Escena escena = escenaRepository.save(new Escena(caso, 1, "Escena", "Desc", "Contenido"));
        Pregunta pregunta = preguntaRepository.save(
                new Pregunta(escena, "Que haria?", true, new BigDecimal("10.00")));
        Opcion opcion = opcionRepository.save(
                new Opcion(pregunta, "Acompanhar", "Desc", 1, new BigDecimal("100.00")));

        Grupo grupo = grupoRepository.save(new Grupo(teacher, "Curso trazabilidad", "Desc", "2026-1", "TRZ-2026"));
        grupoEstudianteRepository.save(new GrupoEstudiante(grupo, student));
        Programacion programacion = programacionRepository.save(new Programacion(
                grupo,
                teacher,
                caso.getId(),
                null,
                Instant.now().minusSeconds(3600),
                Instant.now().plusSeconds(86400)));
        Grupo otroGrupo = grupoRepository.save(new Grupo(otherTeacher, "Otro curso", "Desc", "2026-1", "OTR-2026"));
        Programacion otraProgramacion = programacionRepository.save(new Programacion(
                otroGrupo,
                otherTeacher,
                caso.getId(),
                null,
                Instant.now().minusSeconds(3600),
                Instant.now().plusSeconds(86400)));

        estadoEmocionalRepository.save(new EstadoEmocional("CONFIANZA", "Confianza", 0, 100, 50));
        caseId = caso.getId();
        questionId = pregunta.getId();
        optionId = opcion.getId();
        scheduleId = programacion.getId();
        otherScheduleId = otraProgramacion.getId();
    }

    @Test
    void explicitProgramacionPersistsOnAttempt() throws Exception {
        String studentToken = login("estudiante@agora.com");
        Long attemptId = start(studentToken, "{\"casoId\":" + caseId + ",\"programacionId\":" + scheduleId + "}");
        assertThat(intentoRepository.findById(attemptId).orElseThrow().getProgramacion().getId())
                .isEqualTo(scheduleId);
    }

    @Test
    void autoResolvesActiveProgramacionWhenMissingId() throws Exception {
        String studentToken = login("estudiante@agora.com");
        Long attemptId = start(studentToken, "{\"casoId\":" + caseId + "}");
        assertThat(intentoRepository.findById(attemptId).orElseThrow().getProgramacion().getId())
                .isEqualTo(scheduleId);
    }

    @Test
    void freeModeAllowedWithoutActiveProgramacion() throws Exception {
        programacionRepository.deleteAll();
        String studentToken = login("estudiante@agora.com");
        Long attemptId = start(studentToken, "{\"casoId\":" + caseId + "}");
        assertThat(intentoRepository.findById(attemptId).orElseThrow().getProgramacion()).isNull();
    }

    @Test
    void rejectsProgramacionForOtherStudent() throws Exception {
        Programacion individual = programacionRepository.save(new Programacion(
                programacionRepository.findById(scheduleId).orElseThrow().getGrupo(),
                teacher,
                caseId,
                otherTeacher,
                Instant.now().minusSeconds(3600),
                Instant.now().plusSeconds(86400)));
        String studentToken = login("estudiante@agora.com");
        mockMvc.perform(post("/api/v1/simulations/start")
                        .header("Authorization", bearer(studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"casoId\":" + caseId + ",\"programacionId\":" + individual.getId() + "}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void rejectsExpiredProgramacion() throws Exception {
        Programacion expirada = programacionRepository.save(new Programacion(
                programacionRepository.findById(scheduleId).orElseThrow().getGrupo(),
                teacher,
                caseId,
                student,
                Instant.now().minusSeconds(7200),
                Instant.now().minusSeconds(3600)));
        String studentToken = login("estudiante@agora.com");
        mockMvc.perform(post("/api/v1/simulations/start")
                        .header("Authorization", bearer(studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"casoId\":" + caseId + ",\"programacionId\":" + expirada.getId() + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void gradebookShowsLinkedAttemptAndHidesOrphan() throws Exception {
        String studentToken = login("estudiante@agora.com");
        String teacherToken = login("docente@agora.com");

        Long linkedAttempt = startAndFinish(
                studentToken, "{\"casoId\":" + caseId + ",\"programacionId\":" + scheduleId + "}");

        Caso freeCase = casoRepository.save(new Caso("Caso libre trazabilidad", "Desc", "Obj", "BASICO", 30, teacher));
        Escena escena = escenaRepository.save(new Escena(freeCase, 1, "Escena libre", "Desc", "Contenido"));
        Pregunta pregunta = preguntaRepository.save(
                new Pregunta(escena, "Pregunta libre", true, new BigDecimal("10.00")));
        Opcion opcion = opcionRepository.save(
                new Opcion(pregunta, "Opcion libre", "Desc", 1, new BigDecimal("100.00")));

        Long orphanAttempt = startAndFinishOnCase(studentToken, freeCase.getId(), pregunta.getId(), opcion.getId());

        assertThat(intentoRepository.findById(linkedAttempt).orElseThrow().getProgramacion()).isNotNull();
        assertThat(intentoRepository.findById(orphanAttempt).orElseThrow().getProgramacion()).isNull();

        mockMvc.perform(get("/api/v1/gradebook/entries?size=20").header("Authorization", bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.attemptId == " + linkedAttempt + ")]").exists())
                .andExpect(jsonPath("$.content[?(@.attemptId == " + orphanAttempt + ")]").doesNotExist());
    }

    @Test
    void unrelatedTeacherDoesNotSeeLinkedAttempt() throws Exception {
        String studentToken = login("estudiante@agora.com");
        String otherTeacherToken = login("docente2@agora.com");
        Long attemptId = startAndFinish(studentToken, "{\"casoId\":" + caseId + ",\"programacionId\":" + scheduleId + "}");

        mockMvc.perform(get("/api/v1/gradebook/entries?size=20").header("Authorization", bearer(otherTeacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.attemptId == " + attemptId + ")]").doesNotExist());
    }

    private Long startAndFinishOnCase(String studentToken, Long casoId, Long preguntaId, Long opcionId)
            throws Exception {
        Long attemptId = start(studentToken, "{\"casoId\":" + casoId + "}");
        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/answer")
                        .header("Authorization", bearer(studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"preguntaId\":" + preguntaId + ",\"opcionId\":" + opcionId + "}"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/finish")
                        .header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk());
        return attemptId;
    }

    private Long startAndFinish(String studentToken, String body) throws Exception {
        Long attemptId = start(studentToken, body);
        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/answer")
                        .header("Authorization", bearer(studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"preguntaId\":" + questionId + ",\"opcionId\":" + optionId + "}"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/finish")
                        .header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk());
        return attemptId;
    }

    private Long start(String token, String body) throws Exception {
        String response = mockMvc.perform(post("/api/v1/simulations/start")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
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
