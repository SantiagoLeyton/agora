package com.agora.modules.ai.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.ai.domain.SintesisIa;
import com.agora.modules.ai.dto.AISummaryHistoryResponse;
import com.agora.modules.ai.dto.AISummaryRequest;
import com.agora.modules.ai.dto.AISummaryResponse;
import com.agora.modules.ai.port.AIProviderRequest;
import com.agora.modules.ai.port.AIProviderResult;
import com.agora.modules.ai.provider.MockAIProvider;
import com.agora.modules.ai.provider.OllamaAIProvider;
import com.agora.modules.ai.repository.SintesisIaRepository;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.simulation.domain.Bitacora;
import com.agora.modules.simulation.domain.EstadoIntento;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Respuesta;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.simulation.service.AttemptAccessService;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.UserPrincipal;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AISummaryService {

    private static final String MODULE = "AI";
    private static final String DETERMINISTIC_FALLBACK_MODEL = "local-deterministic-fallback-v1";

    private final SintesisIaRepository sintesisIaRepository;
    private final EstadoIntentoRepository estadoIntentoRepository;
    private final RespuestaRepository respuestaRepository;
    private final BitacoraRepository bitacoraRepository;
    private final AttemptAccessService accessService;
    private final OllamaAIProvider ollamaAIProvider;
    private final MockAIProvider mockAIProvider;
    private final OperationalAuditService auditService;

    @Transactional
    public AISummaryResponse generar(Long attemptId, AISummaryRequest request, UserPrincipal principal, String ip) {
        Intento intento = accessService.buscarIntento(attemptId);
        validarSolicitud(intento, principal);
        Usuario actor = accessService.actor(principal);
        audit(actor, "AI_SUMMARY_REQUESTED", "Sintesis IA solicitada: intento " + attemptId, ip);

        String prompt = construirPrompt(intento, request);
        try {
            AIProviderResult result = ollamaAIProvider.generateSummary(new AIProviderRequest(attemptId, prompt));
            SintesisIa sintesis = sintesisIaRepository.save(new SintesisIa(intento, prompt, result.response(),
                    result.model(), true, null));
            audit(actor, "AI_SUMMARY_GENERATED", "Sintesis IA generada: " + sintesis.getId(), ip);
            log.info("ai.summary event=generated attemptId={} provider=ollama synthesisId={}", attemptId,
                    sintesis.getId());
            return AISummaryResponse.from(sintesis);
        } catch (RuntimeException exception) {
            SintesisIa fallida = sintesisIaRepository.save(new SintesisIa(intento, prompt,
                    "La generacion con Ollama no fue exitosa.", "ollama", false, safeMessage(exception)));
            audit(actor, "AI_SUMMARY_FAILED", "Sintesis IA fallida: " + fallida.getId(), ip);
            log.warn("ai.summary event=ollama_failed attemptId={} synthesisId={} error={}", attemptId,
                    fallida.getId(), exception.getClass().getSimpleName());
            return generarFallback(intento, prompt, actor, ip, exception);
        }
    }

    @Transactional(readOnly = true)
    public AISummaryHistoryResponse listar(Long attemptId, UserPrincipal principal) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        return new AISummaryHistoryResponse(attemptId,
                sintesisIaRepository.findByIntentoIdOrderByFechaGeneracionDesc(attemptId).stream()
                        .map(AISummaryResponse::from)
                        .toList());
    }

    private void validarSolicitud(Intento intento, UserPrincipal principal) {
        if ("ADMINISTRADOR".equals(principal.rol())) {
            return;
        }
        if ("ESTUDIANTE".equals(principal.rol()) && intento.getEstudiante().getId().equals(principal.id())) {
            return;
        }
        throw new AccessDeniedException("No tiene permiso para solicitar sintesis de este intento");
    }

    private String construirPrompt(Intento intento, AISummaryRequest request) {
        String instrucciones = request == null || request.instrucciones() == null || request.instrucciones().isBlank()
                ? "Generar sintesis academica descriptiva sin calificacion."
                : request.instrucciones().trim();
        return """
                Eres un asistente academico para estudiantes de Psicologia Social.
                Genera una sintesis narrativa, observaciones y reflexion academica.

                Reglas obligatorias:
                - No asignar notas.
                - No evaluar desempeno.
                - No aprobar ni reprobar.
                - No calificar.
                - No determinar exito academico.
                - Unicamente describe, interpreta y sintetiza.

                Contexto del intento:
                """
                + "Caso: " + caso(intento).getTitulo()
                + "\nIntento: " + intento.getId()
                + "\nEstado del intento: " + intento.getEstado()
                + "\nRespuestas registradas: " + respuestaRepository.findByIntentoId(intento.getId()).size()
                + "\nEstados actuales: " + estados(intento)
                + "\nRespuestas seleccionadas: " + respuestas(intento)
                + "\nBitacoras del estudiante: " + bitacoras(intento)
                + "\nInstrucciones: " + instrucciones
                + "\nRestriccion final: la IA no define calificaciones academicas ni modifica reglas.";
    }

    private String resumenDeterministico(Intento intento) {
        return "caso " + caso(intento).getTitulo()
                + ", estado " + intento.getEstado()
                + ", respuestas " + respuestaRepository.findByIntentoId(intento.getId()).size()
                + ", estados " + estados(intento);
    }

    private String estados(Intento intento) {
        return estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(intento.getId()).stream()
                .map(this::estado)
                .collect(Collectors.joining(", "));
    }

    private String respuestas(Intento intento) {
        return respuestaRepository.findByIntentoIdOrderByFechaRespuestaAsc(intento.getId()).stream()
                .map(this::respuesta)
                .collect(Collectors.joining(" | "));
    }

    private String respuesta(Respuesta respuesta) {
        return respuesta.getPregunta().getEnunciado() + " -> " + respuesta.getOpcion().getTexto();
    }

    private String bitacoras(Intento intento) {
        return bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(intento.getId()).stream()
                .map(this::bitacora)
                .collect(Collectors.joining(" | "));
    }

    private String bitacora(Bitacora bitacora) {
        return bitacora.getTitulo() + ": " + bitacora.getContenido();
    }

    private String estado(EstadoIntento estado) {
        return estado.getEstadoEmocional().getNombre() + "=" + estado.getValorActual();
    }

    private Caso caso(Intento intento) {
        return intento.getCaso();
    }

    private void audit(Usuario actor, String accion, String descripcion, String ip) {
        auditService.registrar(actor, accion, MODULE, descripcion, ip);
    }

    private AISummaryResponse generarFallback(Intento intento, String prompt, Usuario actor, String ip,
            RuntimeException originalException) {
        try {
            AIProviderResult fallback = mockAIProvider.generateSummary(new AIProviderRequest(intento.getId(), prompt));
            SintesisIa sintesis = sintesisIaRepository.save(new SintesisIa(intento, prompt, fallback.response(),
                    fallback.model(), true, null));
            audit(actor, "AI_SUMMARY_GENERATED", "Sintesis IA fallback generada: " + sintesis.getId(), ip);
            log.info("ai.summary event=fallback_generated attemptId={} provider=mock synthesisId={}",
                    intento.getId(), sintesis.getId());
            return AISummaryResponse.from(sintesis);
        } catch (RuntimeException fallbackException) {
            String respuestaAlternativa = "No fue posible generar una sintesis con el proveedor configurado. "
                    + "Se entrega una sintesis alternativa basada en los datos registrados del intento: "
                    + resumenDeterministico(intento) + ". Esta sintesis no representa una calificacion academica.";
            SintesisIa sintesis = sintesisIaRepository.save(new SintesisIa(intento, prompt, respuestaAlternativa,
                    DETERMINISTIC_FALLBACK_MODEL, false,
                    safeMessage(originalException) + " | fallback: " + safeMessage(fallbackException)));
            audit(actor, "AI_SUMMARY_FAILED", "Sintesis IA fallback fallida: " + sintesis.getId(), ip);
            log.warn("ai.summary event=fallback_failed attemptId={} synthesisId={} error={}", intento.getId(),
                    sintesis.getId(), fallbackException.getClass().getSimpleName());
            return AISummaryResponse.from(sintesis);
        }
    }

    private String safeMessage(RuntimeException exception) {
        return exception.getMessage() == null || exception.getMessage().isBlank()
                ? exception.getClass().getSimpleName()
                : exception.getMessage();
    }
}
