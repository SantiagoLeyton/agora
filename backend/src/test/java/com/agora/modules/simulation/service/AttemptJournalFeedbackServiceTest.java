package com.agora.modules.simulation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.Escena;
import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.modules.simulation.domain.Bitacora;
import com.agora.modules.simulation.domain.EstadoEmocional;
import com.agora.modules.simulation.domain.EstadoIntento;
import com.agora.modules.simulation.domain.FeedbackAuthor;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Respuesta;
import com.agora.modules.simulation.domain.Retroalimentacion;
import com.agora.modules.simulation.dto.CreateFeedbackRequest;
import com.agora.modules.simulation.dto.CreateJournalRequest;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.UserPrincipal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AttemptJournalFeedbackServiceTest {

    @Mock BitacoraRepository bitacoraRepository;
    @Mock RetroalimentacionRepository retroalimentacionRepository;
    @Mock RespuestaRepository respuestaRepository;
    @Mock EstadoIntentoRepository estadoIntentoRepository;
    @Mock EscenaRepository escenaRepository;
    @Mock PreguntaRepository preguntaRepository;
    @Mock AttemptAccessService accessService;
    @Mock OperationalAuditService auditService;

    private AttemptJournalService journalService;
    private AttemptFeedbackService feedbackService;
    private AttemptSummaryService summaryService;
    private Usuario student;
    private Usuario teacher;
    private UserPrincipal studentPrincipal;
    private UserPrincipal otherStudentPrincipal;
    private UserPrincipal teacherPrincipal;
    private Intento intento;

    @BeforeEach
    void setUp() {
        journalService = new AttemptJournalService(bitacoraRepository, accessService, auditService);
        feedbackService = new AttemptFeedbackService(retroalimentacionRepository, respuestaRepository,
                estadoIntentoRepository, escenaRepository, preguntaRepository, accessService, auditService);
        summaryService = new AttemptSummaryService(accessService, respuestaRepository, estadoIntentoRepository,
                bitacoraRepository, retroalimentacionRepository, auditService);
        student = withId(new Usuario(new Rol("ESTUDIANTE", ""), "Estudiante", "Agora",
                "estudiante@agora.com", "hash"), 1L);
        teacher = withId(new Usuario(new Rol("DOCENTE", ""), "Docente", "Agora",
                "docente@agora.com", "hash"), 2L);
        studentPrincipal = new UserPrincipal(1L, "Estudiante", "Agora", "estudiante@agora.com", "hash",
                "ESTUDIANTE", true);
        otherStudentPrincipal = new UserPrincipal(3L, "Otro", "Agora", "otro@agora.com", "hash",
                "ESTUDIANTE", true);
        teacherPrincipal = new UserPrincipal(2L, "Docente", "Agora", "docente@agora.com", "hash", "DOCENTE",
                true);
        Caso caso = withId(new Caso("Caso", null, null, "BASICO", 30, null), 10L);
        Grupo grupo = withId(new Grupo(teacher, "Grupo", null, "2026-1"), 20L);
        Programacion programacion = withId(new Programacion(grupo, teacher, 10L, Instant.now(), Instant.now()), 30L);
        intento = withId(new Intento(student, caso, programacion), 40L);
    }

    @Test
    void createsJournalForOwner() {
        Bitacora bitacora = withId(new Bitacora(intento, "Entrada", "Contenido"), 50L);
        when(accessService.buscarIntento(40L)).thenReturn(intento);
        when(accessService.actor(studentPrincipal)).thenReturn(student);
        when(bitacoraRepository.save(any(Bitacora.class))).thenReturn(bitacora);

        var response = journalService.crear(40L, new CreateJournalRequest("Entrada", "Contenido"),
                studentPrincipal, "127.0.0.1");

        assertThat(response.id()).isEqualTo(50L);
        assertThat(response.titulo()).isEqualTo("Entrada");
    }

    @Test
    void rejectsJournalForAnotherStudent() {
        when(accessService.buscarIntento(40L)).thenReturn(intento);
        org.mockito.Mockito.doThrow(new AccessDeniedException("No puede gestionar un intento de otro estudiante"))
                .when(accessService).validarEstudiantePropietario(intento, otherStudentPrincipal);

        assertThatThrownBy(() -> journalService.crear(40L, new CreateJournalRequest("Entrada", "Contenido"),
                otherStudentPrincipal, "127.0.0.1")).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createsTeacherFeedback() {
        Retroalimentacion feedback = withId(new Retroalimentacion(intento, FeedbackAuthor.DOCENTE, "Texto",
                10L, 1, "Obs"), 60L);
        when(accessService.buscarIntento(40L)).thenReturn(intento);
        when(accessService.actor(teacherPrincipal)).thenReturn(teacher);
        when(respuestaRepository.findByIntentoId(40L)).thenReturn(List.of());
        when(escenaRepository.findByCasoIdOrderByOrdenAsc(10L)).thenReturn(List.of());
        when(retroalimentacionRepository.save(any(Retroalimentacion.class))).thenReturn(feedback);

        var response = feedbackService.crearDocente(40L, new CreateFeedbackRequest("Texto", "Obs"),
                teacherPrincipal, "127.0.0.1");

        assertThat(response.autor()).isEqualTo("DOCENTE");
    }

    @Test
    void generatesSystemFeedback() {
        EstadoEmocional confianza = withId(new EstadoEmocional("CONFIANZA", null, 0, 100, 50), 70L);
        EstadoIntento estado = withId(new EstadoIntento(intento, confianza, 60), 80L);
        when(retroalimentacionRepository.existsByIntentoIdAndAutor(40L, FeedbackAuthor.SISTEMA)).thenReturn(false);
        when(respuestaRepository.findByIntentoId(40L)).thenReturn(List.of());
        when(escenaRepository.findByCasoIdOrderByOrdenAsc(10L)).thenReturn(List.of());
        when(estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(40L)).thenReturn(List.of(estado));
        when(retroalimentacionRepository.save(any(Retroalimentacion.class))).thenAnswer(invocation -> {
            Retroalimentacion feedback = invocation.getArgument(0);
            return withId(feedback, 90L);
        });

        feedbackService.generarSistema(intento, student, "127.0.0.1");

        org.mockito.Mockito.verify(retroalimentacionRepository).save(any(Retroalimentacion.class));
    }

    @Test
    void buildsAttemptSummary() {
        EstadoEmocional confianza = withId(new EstadoEmocional("CONFIANZA", null, 0, 100, 50), 70L);
        EstadoIntento estado = withId(new EstadoIntento(intento, confianza, 60), 80L);
        Bitacora bitacora = withId(new Bitacora(intento, "Entrada", "Contenido"), 50L);
        Retroalimentacion feedback = withId(new Retroalimentacion(intento, FeedbackAuthor.SISTEMA, "Texto",
                10L, 1, null), 60L);
        when(accessService.buscarIntento(40L)).thenReturn(intento);
        when(accessService.actor(studentPrincipal)).thenReturn(student);
        when(respuestaRepository.findByIntentoIdOrderByFechaRespuestaAsc(40L)).thenReturn(List.of());
        when(estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(40L)).thenReturn(List.of(estado));
        when(bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(40L)).thenReturn(List.of(bitacora));
        when(retroalimentacionRepository.findByIntentoIdOrderByFechaGeneracionAsc(40L)).thenReturn(List.of(feedback));

        var response = summaryService.obtener(40L, studentPrincipal, "127.0.0.1");

        assertThat(response.intento().id()).isEqualTo(40L);
        assertThat(response.bitacoras()).hasSize(1);
        assertThat(response.retroalimentaciones()).hasSize(1);
    }

    private <T> T withId(T entity, Long id) {
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }
}
