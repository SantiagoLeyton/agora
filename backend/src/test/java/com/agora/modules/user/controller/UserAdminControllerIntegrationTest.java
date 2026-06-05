package com.agora.modules.user.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class UserAdminControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired RolRepository rolRepository;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired AuditoriaRepository auditoriaRepository;

    private Rol adminRole;
    private Rol teacherRole;
    private Rol studentRole;
    private Usuario target;

    @BeforeEach
    void setUp() {
        auditoriaRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();
        adminRole = rolRepository.save(new Rol("ADMINISTRADOR", "Administrador"));
        teacherRole = rolRepository.save(new Rol("DOCENTE", "Docente"));
        studentRole = rolRepository.save(new Rol("ESTUDIANTE", "Estudiante"));
        usuarioRepository.save(new Usuario(adminRole, "Admin", "Agora", "admin@agora.com",
                passwordEncoder.encode("Agora12345*")));
        usuarioRepository.save(new Usuario(teacherRole, "Docente", "Agora", "docente@agora.com",
                passwordEncoder.encode("Agora12345*")));
        usuarioRepository.save(new Usuario(studentRole, "Estudiante", "Agora", "estudiante@agora.com",
                passwordEncoder.encode("Agora12345*")));
        target = usuarioRepository.save(new Usuario(studentRole, "Ada", "Lovelace", "ada@agora.com",
                passwordEncoder.encode("Agora12345*")));
    }

    @Test
    void adminCreatesAndListsUsers() throws Exception {
        String token = login("admin@agora.com");

        mockMvc.perform(post("/api/v1/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Grace",
                                  "apellido": "Hopper",
                                  "correo": "grace@agora.com",
                                  "passwordTemporal": "Agora12345*",
                                  "rol": "DOCENTE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.correo").value("grace@agora.com"))
                .andExpect(jsonPath("$.rol").value("DOCENTE"));

        mockMvc.perform(get("/api/v1/users?rol=DOCENTE&activo=true&search=grace")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].correo").value("grace@agora.com"));

        assertThat(auditoriaRepository.findAll()).anyMatch(audit -> "USER_CREATED".equals(audit.getAccion()));
    }

    @Test
    void rejectsDuplicateEmailAndMissingRole() throws Exception {
        String token = login("admin@agora.com");

        mockMvc.perform(post("/api/v1/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Ada",
                                  "apellido": "Lovelace",
                                  "correo": "ada@agora.com",
                                  "passwordTemporal": "Agora12345*",
                                  "rol": "ESTUDIANTE"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("El correo ya esta registrado"));

        mockMvc.perform(post("/api/v1/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Alan",
                                  "apellido": "Turing",
                                  "correo": "alan@agora.com",
                                  "passwordTemporal": "Agora12345*",
                                  "rol": "NO_EXISTE"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Rol no encontrado"));
    }

    @Test
    void passwordChangeRevokesActiveRefreshTokens() throws Exception {
        String adminToken = login("admin@agora.com");
        JsonNode targetLogin = loginResponse("ada@agora.com");
        String refreshToken = targetLogin.get("refreshToken").asText();
        assertThat(refreshTokenRepository.findByToken(refreshToken)).isPresent();

        mockMvc.perform(patch("/api/v1/users/" + target.getId() + "/password")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"NewAgora12345*\"}"))
                .andExpect(status().isNoContent());

        assertThat(refreshTokenRepository.findByToken(refreshToken)).get().extracting("revocado").isEqualTo(true);
        assertThat(auditoriaRepository.findAll()).anyMatch(audit ->
                "USER_PASSWORD_CHANGED".equals(audit.getAccion()));
    }

    @Test
    void protectsAdministrativeEndpointsByRoleAndJwt() throws Exception {
        mockMvc.perform(get("/api/v1/users").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + login("docente@agora.com")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + login("estudiante@agora.com")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/roles").header("Authorization", "Bearer " + login("admin@agora.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").exists());
    }

    @Test
    void adminCanReadAudit() throws Exception {
        String token = login("admin@agora.com");

        mockMvc.perform(get("/api/v1/audit?modulo=AUTH")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    private String login(String correo) throws Exception {
        return loginResponse(correo).get("accessToken").asText();
    }

    private JsonNode loginResponse(String correo) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"" + correo + "\",\"password\":\"Agora12345*\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response);
    }
}
