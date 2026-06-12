package com.agora.modules.ai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.ai.domain.SintesisIa;
import com.agora.modules.ai.dto.AISummaryRequest;
import com.agora.modules.ai.port.AIProviderResult;
import com.agora.modules.ai.provider.MockAIProvider;
import com.agora.modules.ai.provider.OllamaAIProvider;
import com.agora.modules.ai.repository.SintesisIaRepository;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.simulation.domain.EstadoEmocional;
import com.agora.modules.simulation.domain.EstadoIntento;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.simulation.service.AttemptAccessService;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.UserPrincipal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AISummaryServiceTest {

    @Mock SintesisIaRepository sintesisIaRepository;
    @Mock EstadoIntentoRepository estadoIntentoRepository;
    @Mock RespuestaRepository respuestaRepository;
    @Mock BitacoraRepository bitacoraRepository;
    @Mock AttemptAccessService accessService;
    @Mock OllamaAIProvider ollamaAIProvider;
    @Mock MockAIProvider mockAIProvider;
    @Mock OperationalAuditService auditService;

    private AISummaryService service;
    private Usuario student;
    private Usuario teacher;
    private UserPrincipal studentPrincipal;
    private UserPrincipal teacherPrincipal;
    private Intento intento;

    @BeforeEach
    void setUp() {
        service = new AISummaryService(sintesisIaRepository, estadoIntentoRepository, respuestaRepository,
                bitacoraRepository, accessService, ollamaAIProvider, mockAIProvider, auditService);
        student = withId(new Usuario(new Rol("ESTUDIANTE", ""), "Estudiante", "Agora",
                "estudiante@agora.com", "hash"), 1L);
        teacher = withId(new Usuario(new Rol("DOCENTE", ""), "Docente", "Agora",
                "docente@agora.com", "hash"), 2L);
        studentPrincipal = new UserPrincipal(1L, "Estudiante", "Agora", "estudiante@agora.com", "hash",
                "ESTUDIANTE", true);
        teacherPrincipal = new UserPrincipal(2L, "Docente", "Agora", "docente@agora.com", "hash", "DOCENTE",
                true);
        Caso caso = withId(new Caso("Caso IA", null, null, "BASICO", 30, null), 10L);
        Grupo grupo = withId(new Grupo(teacher, "Grupo", null, "2026-1"), 20L);
        Programacion programacion = withId(new Programacion(grupo, teacher, 10L, Instant.now(), Instant.now()), 30L);
        intento = withId(new Intento(student, caso, programacion), 40L);
    }

    @Test
    void generatesAndStoresSummary() {
        EstadoEmocional confianza = withId(new EstadoEmocional("CONFIANZA", null, 0, 100, 50), 50L);
        EstadoIntento estado = withId(new EstadoIntento(intento, confianza, 70), 60L);
        when(accessService.buscarIntento(40L)).thenReturn(intento);
        when(accessService.actor(studentPrincipal)).thenReturn(student);
        when(respuestaRepository.findByIntentoId(40L)).thenReturn(List.of());
        when(respuestaRepository.findByIntentoIdOrderByFechaRespuestaAsc(40L)).thenReturn(List.of());
        when(estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(40L)).thenReturn(List.of(estado));
        when(bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(40L)).thenReturn(List.of());
        when(ollamaAIProvider.generateSummary(any())).thenReturn(new AIProviderResult("Sintesis ollama", "llama3.1:8b"));
        when(sintesisIaRepository.save(any(SintesisIa.class))).thenAnswer(invocation -> {
            SintesisIa sintesis = invocation.getArgument(0);
            return withId(sintesis, 70L);
        });

        var response = service.generar(40L, new AISummaryRequest("Analizar cooperacion"), studentPrincipal,
                "127.0.0.1");

        assertThat(response.id()).isEqualTo(70L);
        assertThat(response.fueExitosa()).isTrue();
        assertThat(response.modeloUtilizado()).isEqualTo("llama3.1:8b");
    }

    @Test
    void storesFailedOllamaAndFallbackWhenProviderFails() {
        when(accessService.buscarIntento(40L)).thenReturn(intento);
        when(accessService.actor(studentPrincipal)).thenReturn(student);
        when(respuestaRepository.findByIntentoId(40L)).thenReturn(List.of());
        when(respuestaRepository.findByIntentoIdOrderByFechaRespuestaAsc(40L)).thenReturn(List.of());
        when(estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(40L)).thenReturn(List.of());
        when(bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(40L)).thenReturn(List.of());
        when(ollamaAIProvider.generateSummary(any())).thenThrow(new IllegalStateException("Proveedor caido"));
        when(mockAIProvider.generateSummary(any())).thenReturn(new AIProviderResult("Sintesis fallback", MockAIProvider.MODEL));
        when(sintesisIaRepository.save(any(SintesisIa.class))).thenAnswer(invocation -> {
            SintesisIa sintesis = invocation.getArgument(0);
            if (sintesis.isFueExitosa()) {
                return withId(sintesis, 81L);
            }
            return withId(sintesis, 80L);
        });

        var response = service.generar(40L, new AISummaryRequest(null), studentPrincipal, "127.0.0.1");

        assertThat(response.id()).isEqualTo(81L);
        assertThat(response.fueExitosa()).isTrue();
        assertThat(response.modeloUtilizado()).isEqualTo(MockAIProvider.MODEL);
        assertThat(response.mensajeError()).isNull();
    }

    @Test
    void returnsDeterministicFallbackWhenMockAlsoFails() {
        when(accessService.buscarIntento(40L)).thenReturn(intento);
        when(accessService.actor(studentPrincipal)).thenReturn(student);
        when(respuestaRepository.findByIntentoId(40L)).thenReturn(List.of());
        when(respuestaRepository.findByIntentoIdOrderByFechaRespuestaAsc(40L)).thenReturn(List.of());
        when(estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(40L)).thenReturn(List.of());
        when(bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(40L)).thenReturn(List.of());
        when(ollamaAIProvider.generateSummary(any())).thenThrow(new IllegalStateException("Ollama caido"));
        when(mockAIProvider.generateSummary(any())).thenThrow(new IllegalStateException("Mock caido"));
        when(sintesisIaRepository.save(any(SintesisIa.class))).thenAnswer(invocation -> {
            SintesisIa sintesis = invocation.getArgument(0);
            return withId(sintesis, sintesis.getModeloUtilizado().startsWith("local") ? 82L : 80L);
        });

        var response = service.generar(40L, new AISummaryRequest(null), studentPrincipal, "127.0.0.1");

        assertThat(response.id()).isEqualTo(82L);
        assertThat(response.fueExitosa()).isFalse();
        assertThat(response.modeloUtilizado()).isEqualTo("local-deterministic-fallback-v1");
        assertThat(response.mensajeError()).contains("Ollama caido").contains("Mock caido");
    }

    @Test
    void teacherCannotGenerateSummary() {
        when(accessService.buscarIntento(40L)).thenReturn(intento);

        assertThatThrownBy(() -> service.generar(40L, new AISummaryRequest(null), teacherPrincipal, "127.0.0.1"))
                .isInstanceOf(AccessDeniedException.class);
    }

    private <T> T withId(T entity, Long id) {
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }
}
