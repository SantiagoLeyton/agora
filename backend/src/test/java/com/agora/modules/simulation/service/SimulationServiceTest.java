package com.agora.modules.simulation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.repository.ProgramacionRepository;
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
import com.agora.modules.simulation.domain.EstadoIntento;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Respuesta;
import com.agora.modules.simulation.dto.AnswerSimulationRequest;
import com.agora.modules.simulation.dto.StartSimulationRequest;
import com.agora.modules.simulation.repository.ConsecuenciaEstadoRepository;
import com.agora.modules.simulation.repository.ConsecuenciaRepository;
import com.agora.modules.simulation.repository.EstadoEmocionalRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class SimulationServiceTest {

    @Mock IntentoRepository intentoRepository;
    @Mock RespuestaRepository respuestaRepository;
    @Mock EstadoEmocionalRepository estadoEmocionalRepository;
    @Mock EstadoIntentoRepository estadoIntentoRepository;
    @Mock ConsecuenciaRepository consecuenciaRepository;
    @Mock ConsecuenciaEstadoRepository consecuenciaEstadoRepository;
    @Mock CasoRepository casoRepository;
    @Mock EscenaRepository escenaRepository;
    @Mock PreguntaRepository preguntaRepository;
    @Mock OpcionRepository opcionRepository;
    @Mock ProgramacionRepository programacionRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock OperationalAuditService auditService;
    @Mock AttemptFeedbackService feedbackService;

    private SimulationService service;
    private Usuario student;
    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        service = new SimulationService(intentoRepository, respuestaRepository, estadoEmocionalRepository,
                estadoIntentoRepository, consecuenciaRepository, consecuenciaEstadoRepository, casoRepository,
                escenaRepository, preguntaRepository, opcionRepository, programacionRepository, usuarioRepository,
                auditService, feedbackService);
        student = withId(new Usuario(new Rol("ESTUDIANTE", ""), "Estudiante", "Agora",
                "estudiante@agora.com", "hash"), 1L);
        principal = new UserPrincipal(1L, "Estudiante", "Agora", "estudiante@agora.com", "hash", "ESTUDIANTE",
                true);
    }

    @Test
    void startsAttemptAndCreatesInitialStates() {
        Caso caso = withId(new Caso("Caso", null, null, "BASICO", 30), 10L);
        EstadoEmocional confianza = withId(new EstadoEmocional("CONFIANZA", null, 0, 100, 50), 100L);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(student));
        when(casoRepository.findById(10L)).thenReturn(Optional.of(caso));
        when(intentoRepository.save(any(Intento.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 20L));
        when(estadoEmocionalRepository.findAll()).thenReturn(List.of(confianza));

        var response = service.iniciar(new StartSimulationRequest(10L, null), principal, "127.0.0.1");

        assertThat(response.intentoId()).isEqualTo(20L);
        verify(estadoIntentoRepository).save(any(EstadoIntento.class));
    }

    @Test
    void appliesConsequenceAndUpdatesStates() {
        Caso caso = withId(new Caso("Caso", null, null, "BASICO", 30), 10L);
        Escena escena = withId(new Escena(caso, 1, "Escena", null, "Contenido"), 11L);
        Pregunta pregunta = withId(new Pregunta(escena, "Pregunta", true), 12L);
        Opcion opcion = withId(new Opcion(pregunta, "Opcion", null, 1), 13L);
        Intento intento = withId(new Intento(student, caso, null), 20L);
        EstadoEmocional confianza = withId(new EstadoEmocional("CONFIANZA", null, 0, 100, 50), 100L);
        EstadoIntento estado = withId(new EstadoIntento(intento, confianza, 50), 200L);
        Consecuencia consecuencia = withId(new Consecuencia(opcion, "Suma confianza", "Bien"), 300L);
        ConsecuenciaEstado variacion = new ConsecuenciaEstado(consecuencia, confianza, 10);
        Respuesta respuesta = withId(new Respuesta(intento, pregunta, opcion), 400L);
        when(intentoRepository.findById(20L)).thenReturn(Optional.of(intento));
        when(preguntaRepository.findById(12L)).thenReturn(Optional.of(pregunta));
        when(opcionRepository.findById(13L)).thenReturn(Optional.of(opcion));
        when(respuestaRepository.existsByIntentoIdAndPreguntaId(20L, 12L)).thenReturn(false);
        when(respuestaRepository.save(any(Respuesta.class))).thenReturn(respuesta);
        when(consecuenciaRepository.findByOpcionId(13L)).thenReturn(Optional.of(consecuencia));
        when(consecuenciaEstadoRepository.findByConsecuenciaId(300L)).thenReturn(List.of(variacion));
        when(estadoIntentoRepository.findByIntentoIdAndEstadoEmocionalId(20L, 100L)).thenReturn(Optional.of(estado));
        when(estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(20L)).thenReturn(List.of(estado));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(student));

        var response = service.responder(20L, new AnswerSimulationRequest(12L, 13L), principal, "127.0.0.1");

        assertThat(response.respuestaId()).isEqualTo(400L);
        assertThat(response.estados().getFirst().valorActual()).isEqualTo(60);
    }

    @Test
    void clampsToMinimum() {
        EstadoEmocional ansiedad = new EstadoEmocional("ANSIEDAD", null, 0, 100, 50);
        EstadoIntento estado = new EstadoIntento(new Intento(student,
                new Caso("Caso", null, null, "BASICO", 30), null), ansiedad, 5);

        estado.aplicarVariacion(-20);

        assertThat(estado.getValorActual()).isZero();
    }

    @Test
    void clampsToMaximum() {
        EstadoEmocional confianza = new EstadoEmocional("CONFIANZA", null, 0, 100, 50);
        EstadoIntento estado = new EstadoIntento(new Intento(student,
                new Caso("Caso", null, null, "BASICO", 30), null), confianza, 95);

        estado.aplicarVariacion(20);

        assertThat(estado.getValorActual()).isEqualTo(100);
    }

    private <T> T withId(T entity, Long id) {
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }
}
