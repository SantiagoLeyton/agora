package com.agora.modules.simulation.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.case_management.domain.Escena;
import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.modules.simulation.domain.FeedbackAuthor;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Retroalimentacion;
import com.agora.modules.simulation.dto.CreateFeedbackRequest;
import com.agora.modules.simulation.dto.FeedbackResponse;
import com.agora.modules.simulation.dto.SimulationStateResponse;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ResourceNotFoundException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttemptFeedbackService {

    private static final String MODULE = "SIMULATION";
    private static final String NON_GRADING_NOTICE = "Esta sintesis no representa una calificacion academica.";

    private final RetroalimentacionRepository retroalimentacionRepository;
    private final RespuestaRepository respuestaRepository;
    private final EstadoIntentoRepository estadoIntentoRepository;
    private final EscenaRepository escenaRepository;
    private final PreguntaRepository preguntaRepository;
    private final AttemptAccessService accessService;
    private final OperationalAuditService auditService;

    @Transactional
    public FeedbackResponse crearDocente(Long attemptId, CreateFeedbackRequest request, UserPrincipal principal,
            String ip) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarFeedbackDocenteOAdmin(intento, principal);
        Retroalimentacion feedback = retroalimentacionRepository.save(new Retroalimentacion(intento,
                FeedbackAuthor.DOCENTE, request.contenido(), duracionSegundos(intento), escenasCompletadas(intento),
                request.observaciones()));
        audit(accessService.actor(principal), "FEEDBACK_CREATED", "Retroalimentacion creada: " + feedback.getId(), ip);
        return FeedbackResponse.from(feedback);
    }

    @Transactional
    public FeedbackResponse actualizarDocente(Long attemptId, Long feedbackId, CreateFeedbackRequest request,
            UserPrincipal principal, String ip) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarFeedbackDocenteOAdmin(intento, principal);
        Retroalimentacion feedback = retroalimentacionRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Retroalimentacion no encontrada"));
        if (!feedback.getIntento().getId().equals(attemptId)) {
            throw new BusinessRuleException("La retroalimentacion no pertenece al intento indicado");
        }
        if (feedback.getAutor() != FeedbackAuthor.DOCENTE) {
            throw new BusinessRuleException("Solo se puede editar retroalimentacion docente");
        }
        feedback.actualizar(request.contenido(), request.observaciones());
        Retroalimentacion guardado = retroalimentacionRepository.save(feedback);
        audit(accessService.actor(principal), "FEEDBACK_UPDATED",
                "Retroalimentacion actualizada: " + guardado.getId(), ip);
        return FeedbackResponse.from(guardado);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> listar(Long attemptId, UserPrincipal principal) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        return retroalimentacionRepository.findByIntentoIdOrderByFechaGeneracionAsc(attemptId).stream()
                .map(FeedbackResponse::from)
                .toList();
    }

    @Transactional
    public void generarSistema(Intento intento, Usuario actor, String ip) {
        if (retroalimentacionRepository.existsByIntentoIdAndAutor(intento.getId(), FeedbackAuthor.SISTEMA)) {
            return;
        }
        int respuestas = respuestaRepository.findByIntentoId(intento.getId()).size();
        Long duracion = duracionSegundos(intento);
        Integer escenas = escenasCompletadas(intento);
        String estados = estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(intento.getId()).stream()
                .map(SimulationStateResponse::from)
                .map(estado -> estado.nombre() + " " + estado.valorActual())
                .collect(Collectors.joining(", "));
        String contenido = "El intento fue finalizado con " + respuestas + " respuestas registradas. "
                + "Duracion aproximada: " + duracion + " segundos. Estados finales: " + estados + ". "
                + NON_GRADING_NOTICE;
        String observaciones = "Sintesis descriptiva generada automaticamente sin IA.";
        Retroalimentacion feedback = retroalimentacionRepository.save(new Retroalimentacion(intento,
                FeedbackAuthor.SISTEMA, contenido, duracion, escenas, observaciones));
        audit(actor, "SYSTEM_FEEDBACK_CREATED", "Retroalimentacion del sistema creada: " + feedback.getId(), ip);
    }

    private Long duracionSegundos(Intento intento) {
        Instant fin = intento.getFechaFin() == null ? Instant.now() : intento.getFechaFin();
        return Math.max(0L, Duration.between(intento.getFechaInicio(), fin).getSeconds());
    }

    private Integer escenasCompletadas(Intento intento) {
        Set<Long> respondidas = respuestaRepository.findByIntentoId(intento.getId()).stream()
                .map(respuesta -> respuesta.getPregunta().getId())
                .collect(Collectors.toSet());
        int completadas = 0;
        List<Escena> escenas = escenaRepository.findByCasoIdOrderByOrdenAsc(intento.getCaso().getId()).stream()
                .filter(Escena::isActivo)
                .toList();
        for (Escena escena : escenas) {
            List<Pregunta> preguntas = preguntaRepository.findByEscenaIdOrderByIdAsc(escena.getId()).stream()
                    .filter(Pregunta::isActivo)
                    .toList();
            if (!preguntas.isEmpty() && preguntas.stream().allMatch(pregunta -> respondidas.contains(pregunta.getId()))) {
                completadas++;
            }
        }
        return completadas;
    }

    private void audit(Usuario actor, String accion, String descripcion, String ip) {
        auditService.registrar(actor, accion, MODULE, descripcion, ip);
    }
}
