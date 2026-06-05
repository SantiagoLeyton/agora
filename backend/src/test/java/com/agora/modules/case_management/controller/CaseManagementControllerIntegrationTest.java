package com.agora.modules.case_management.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.agora.modules.auth.repository.AuditoriaRepository;
import com.agora.modules.auth.repository.RefreshTokenRepository;
import com.agora.modules.case_management.repository.CasoRepository;
import com.agora.modules.case_management.repository.EntidadInstitucionalRepository;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.HerramientaRepository;
import com.agora.modules.case_management.repository.OpcionRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
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
class CaseManagementControllerIntegrationTest {

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
    @Autowired HerramientaRepository herramientaRepository;
    @Autowired EntidadInstitucionalRepository entidadRepository;

    @BeforeEach
    void setUp() {
        opcionRepository.deleteAll();
        preguntaRepository.deleteAll();
        escenaRepository.deleteAll();
        casoRepository.deleteAll();
        herramientaRepository.deleteAll();
        entidadRepository.deleteAll();
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
    }

    @Test
    void teacherBuildsCaseAndAdminReadsIt() throws Exception {
        String teacher = login("docente@agora.com");
        String admin = login("admin@agora.com");
        Long caseId = createCase(teacher);
        Long sceneId = createScene(teacher, caseId, 1);
        Long questionId = createQuestion(teacher, sceneId);
        createOption(teacher, questionId, 1);
        Long toolId = createTool(teacher);
        Long entityId = createEntity(teacher);
        mockMvc.perform(post("/api/v1/cases/" + caseId + "/tools/" + toolId).header("Authorization", bearer(teacher)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/cases/" + caseId + "/entities/" + entityId).header("Authorization", bearer(teacher)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/cases/" + caseId + "/builder").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caso.id").value(caseId))
                .andExpect(jsonPath("$.escenas[0].preguntas[0].opciones[0].orden").value(1))
                .andExpect(jsonPath("$.herramientas[0].id").value(toolId))
                .andExpect(jsonPath("$.entidades[0].id").value(entityId));
    }

    @Test
    void protectsCasesByRoleAndActiveState() throws Exception {
        String teacher = login("docente@agora.com");
        String student = login("estudiante@agora.com");
        Long caseId = createCase(teacher);

        mockMvc.perform(post("/api/v1/cases").header("Authorization", bearer(student))
                        .contentType(MediaType.APPLICATION_JSON).content(caseBody()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/cases").header("Authorization", bearer(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(caseId));

        mockMvc.perform(patch("/api/v1/cases/" + caseId + "/deactivate").header("Authorization", bearer(teacher)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/cases/" + caseId).header("Authorization", bearer(student)))
                .andExpect(status().isForbidden());
    }

    @Test
    void rejectsDuplicateSceneAndOptionOrder() throws Exception {
        String teacher = login("docente@agora.com");
        Long caseId = createCase(teacher);
        Long sceneId = createScene(teacher, caseId, 1);

        mockMvc.perform(post("/api/v1/cases/" + caseId + "/scenes").header("Authorization", bearer(teacher))
                        .contentType(MediaType.APPLICATION_JSON).content(sceneBody(1)))
                .andExpect(status().isConflict());

        Long questionId = createQuestion(teacher, sceneId);
        createOption(teacher, questionId, 1);
        mockMvc.perform(post("/api/v1/questions/" + questionId + "/options").header("Authorization", bearer(teacher))
                        .contentType(MediaType.APPLICATION_JSON).content(optionBody(1)))
                .andExpect(status().isConflict());
    }

    private Long createCase(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/cases").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(caseBody()))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private Long createScene(String token, Long caseId, int order) throws Exception {
        String response = mockMvc.perform(post("/api/v1/cases/" + caseId + "/scenes")
                        .header("Authorization", bearer(token)).contentType(MediaType.APPLICATION_JSON)
                        .content(sceneBody(order)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private Long createQuestion(String token, Long sceneId) throws Exception {
        String response = mockMvc.perform(post("/api/v1/scenes/" + sceneId + "/questions")
                        .header("Authorization", bearer(token)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enunciado\":\"Que haria?\",\"obligatoria\":true}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private void createOption(String token, Long questionId, int order) throws Exception {
        mockMvc.perform(post("/api/v1/questions/" + questionId + "/options").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(optionBody(order)))
                .andExpect(status().isCreated());
    }

    private Long createTool(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/tools").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Genograma\",\"descripcion\":\"Mapa\",\"tipo\":\"MAPA\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private Long createEntity(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/institutional-entities").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Comisaria\",\"tipo\":\"PUBLICA\",\"descripcion\":\"Entidad\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private String caseBody() {
        return "{\"titulo\":\"Caso comunitario\",\"descripcion\":\"Desc\",\"objetivo\":\"Obj\","
                + "\"nivelDificultad\":\"BASICO\",\"duracionEstimada\":45}";
    }

    private String sceneBody(int order) {
        return "{\"orden\":" + order + ",\"titulo\":\"Escena\",\"descripcion\":\"Desc\",\"contenido\":\"Contenido\"}";
    }

    private String optionBody(int order) {
        return "{\"texto\":\"Opcion\",\"descripcion\":\"Desc\",\"orden\":" + order + "}";
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
