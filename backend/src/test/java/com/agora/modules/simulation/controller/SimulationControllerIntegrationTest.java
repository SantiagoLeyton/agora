package com.agora.modules.simulation.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.agora.modules.simulation.domain.Consecuencia;
import com.agora.modules.simulation.domain.ConsecuenciaEstado;
import com.agora.modules.simulation.domain.EstadoEmocional;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.simulation.repository.ConsecuenciaEstadoRepository;
import com.agora.modules.simulation.repository.ConsecuenciaRepository;
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
class SimulationControllerIntegrationTest {

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
    @Autowired EstadoEmocionalRepository estadoEmocionalRepository;
    @Autowired ConsecuenciaRepository consecuenciaRepository;
    @Autowired ConsecuenciaEstadoRepository consecuenciaEstadoRepository;
    @Autowired EstadoIntentoRepository estadoIntentoRepository;
    @Autowired RespuestaRepository respuestaRepository;
    @Autowired IntentoRepository intentoRepository;
    @Autowired BitacoraRepository bitacoraRepository;
    @Autowired RetroalimentacionRepository retroalimentacionRepository;

    private Long caseId;
    private Long questionId;
    private Long optionId;

    @BeforeEach
    void setUp() {
        retroalimentacionRepository.deleteAll();
        bitacoraRepository.deleteAll();
        consecuenciaEstadoRepository.deleteAll();
        consecuenciaRepository.deleteAll();
        estadoIntentoRepository.deleteAll();
        respuestaRepository.deleteAll();
        intentoRepository.deleteAll();
        estadoEmocionalRepository.deleteAll();
        opcionRepository.deleteAll();
        preguntaRepository.deleteAll();
        escenaRepository.deleteAll();
        casoRepository.deleteAll();
        auditoriaRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();

        Rol admin = rolRepository.save(new Rol("ADMINISTRADOR", "Administrador"));
        Rol teacher = rolRepository.save(new Rol("DOCENTE", "Docente"));
        Rol student = rolRepository.save(new Rol("ESTUDIANTE", "Estudiante"));
        usuarioRepository.save(new Usuario(admin, "Admin", "Agora", "admin@agora.com",
                passwordEncoder.encode("Agora12345*")));
        usuarioRepository.save(new Usuario(teacher, "Docente", "Agora", "docente@agora.com",
                passwordEncoder.encode("Agora12345*")));
        usuarioRepository.save(new Usuario(student, "Estudiante", "Agora", "estudiante@agora.com",
                passwordEncoder.encode("Agora12345*")));

        Caso caso = casoRepository.save(new Caso("Caso simulacion", "Desc", "Obj", "BASICO", 45));
        Escena escena = escenaRepository.save(new Escena(caso, 1, "Escena", "Desc", "Contenido"));
        Pregunta pregunta = preguntaRepository.save(new Pregunta(escena, "Que haria?", true));
        Opcion opcion = opcionRepository.save(new Opcion(pregunta, "Intervenir", "Desc", 1));
        EstadoEmocional confianza = estadoEmocionalRepository.save(
                new EstadoEmocional("CONFIANZA", "Confianza", 0, 100, 50));
        Consecuencia consecuencia = consecuenciaRepository.save(new Consecuencia(opcion, "Aumenta confianza", "Bien"));
        consecuenciaEstadoRepository.save(new ConsecuenciaEstado(consecuencia, confianza, 10));
        caseId = caso.getId();
        questionId = pregunta.getId();
        optionId = opcion.getId();
    }

    @Test
    void studentRunsCompleteSimulation() throws Exception {
        String student = login("estudiante@agora.com");
        String admin = login("admin@agora.com");

        Long attemptId = start(student);

        mockMvc.perform(get("/api/v1/simulations/" + attemptId).header("Authorization", bearer(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intento.estado").value("EN_PROCESO"))
                .andExpect(jsonPath("$.escenaActual.id").exists())
                .andExpect(jsonPath("$.estados[0].valorActual").value(50));

        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/answer").header("Authorization", bearer(student))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"preguntaId\":" + questionId + ",\"opcionId\":" + optionId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estados[0].valorActual").value(60));

        mockMvc.perform(get("/api/v1/simulations/" + attemptId + "/states").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].valorActual").value(60));

        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/finish")
                        .header("Authorization", bearer(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intento.estado").value("FINALIZADO"));
    }

    @Test
    void protectsSimulationActionsByRole() throws Exception {
        String student = login("estudiante@agora.com");
        String teacher = login("docente@agora.com");
        Long attemptId = start(student);

        mockMvc.perform(post("/api/v1/simulations/start").header("Authorization", bearer(teacher))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"casoId\":" + caseId + "}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/simulations/" + attemptId + "/answer").header("Authorization", bearer(teacher))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"preguntaId\":" + questionId + ",\"opcionId\":" + optionId + "}"))
                .andExpect(status().isForbidden());
    }

    private Long start(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/simulations/start").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"casoId\":" + caseId + "}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("intentoId").asLong();
    }

    private String login(String correo) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"" + correo + "\",\"password\":\"Agora12345*\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode login = objectMapper.readTree(response);
        return login.get("accessToken").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
