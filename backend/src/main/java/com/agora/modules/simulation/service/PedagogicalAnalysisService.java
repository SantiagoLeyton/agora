package com.agora.modules.simulation.service;

import com.agora.modules.simulation.domain.FeedbackAuthor;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.dto.AttemptConsequenceResponse;
import com.agora.modules.simulation.dto.PedagogicalAnalysisResponse;
import com.agora.modules.simulation.dto.RdaComplianceStatus;
import com.agora.modules.simulation.dto.RdaEvaluationItemResponse;
import com.agora.modules.simulation.dto.SimulationStateResponse;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.security.UserPrincipal;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PedagogicalAnalysisService {

    private static final Set<String> CHALLENGE_STATES = Set.of("ANSIEDAD", "ESTRES", "RESISTENCIA");
    private static final int CHALLENGE_THRESHOLD = 65;

    private final AttemptAccessService accessService;
    private final ConsequenceQueryService consequenceQueryService;
    private final RdaEvaluationService rdaEvaluationService;
    private final EstadoIntentoRepository estadoIntentoRepository;
    private final RetroalimentacionRepository retroalimentacionRepository;

    @Transactional(readOnly = true)
    public PedagogicalAnalysisResponse analizar(Long attemptId, UserPrincipal principal) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);

        List<AttemptConsequenceResponse> consecuencias =
                consequenceQueryService.listarPorIntento(attemptId, principal).consecuencias();
        List<SimulationStateResponse> estados = estadoIntentoRepository
                .findByIntentoIdOrderByEstadoEmocionalNombreAsc(attemptId).stream()
                .map(SimulationStateResponse::from)
                .toList();
        List<RdaEvaluationItemResponse> rdaItems =
                rdaEvaluationService.evaluarCaso(intento.getCaso().getId(), attemptId);

        List<RdaEvaluationItemResponse> alcanzados = rdaItems.stream()
                .filter(item -> item.estado() == RdaComplianceStatus.CUMPLIDO)
                .toList();
        List<RdaEvaluationItemResponse> pendientes = rdaItems.stream()
                .filter(item -> item.estado() != RdaComplianceStatus.CUMPLIDO)
                .toList();

        String retroalimentacionClinica = construirRetroalimentacionClinica(consecuencias, estados, intento);
        String retroalimentacionPedagogica = construirRetroalimentacionPedagogica(consecuencias, rdaItems, intento);
        List<String> recomendaciones = construirRecomendaciones(estados, pendientes, consecuencias);

        return new PedagogicalAnalysisResponse(
                attemptId,
                retroalimentacionClinica,
                retroalimentacionPedagogica,
                recomendaciones,
                alcanzados,
                pendientes,
                consecuencias,
                estados,
                intento.getNotaFinal());
    }

    private String construirRetroalimentacionClinica(
            List<AttemptConsequenceResponse> consecuencias,
            List<SimulationStateResponse> estados,
            Intento intento) {
        StringBuilder builder = new StringBuilder();
        builder.append("Simulacion del caso \"").append(intento.getCaso().getTitulo()).append("\". ");
        if (consecuencias.isEmpty()) {
            builder.append("No se registraron consecuencias clinicas explicitas por decision.");
        } else {
            builder.append("Consecuencias clinicas observadas: ");
            builder.append(consecuencias.stream()
                    .map(item -> item.mensaje() != null ? item.mensaje() : item.opcion())
                    .collect(Collectors.joining(" · ")));
            builder.append(".");
        }
        if (!estados.isEmpty()) {
            builder.append(" Perfil emocional final: ");
            builder.append(estados.stream()
                    .map(estado -> estado.nombre() + " " + estado.valorActual() + "%")
                    .collect(Collectors.joining(", ")));
            builder.append(".");
        }
        retroalimentacionRepository.findByIntentoIdOrderByFechaGeneracionAsc(intento.getId()).stream()
                .filter(item -> item.getAutor() == FeedbackAuthor.DOCENTE)
                .findFirst()
                .ifPresent(feedback -> builder.append(" Retroalimentacion docente: ")
                        .append(feedback.getContenido())
                        .append("."));
        return builder.toString();
    }

    private String construirRetroalimentacionPedagogica(
            List<AttemptConsequenceResponse> consecuencias,
            List<RdaEvaluationItemResponse> rdaItems,
            Intento intento) {
        StringBuilder builder = new StringBuilder();
        builder.append("Analisis pedagogico del intento ").append(intento.getId()).append(". ");
        if (intento.getNotaFinal() != null) {
            builder.append("Nota academica registrada: ").append(intento.getNotaFinal()).append("/5. ");
        }
        List<String> observaciones = consecuencias.stream()
                .map(AttemptConsequenceResponse::observacionPedagogica)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .toList();
        if (!observaciones.isEmpty()) {
            builder.append("Observaciones formativas por decision: ");
            builder.append(String.join(" ", observaciones));
        } else {
            builder.append("Revise las decisiones tomadas frente a los resultados de aprendizaje del caso.");
        }
        long cumplidos = rdaItems.stream()
                .filter(item -> item.estado() == RdaComplianceStatus.CUMPLIDO)
                .count();
        builder.append(" RDA con evidencia suficiente: ")
                .append(cumplidos)
                .append(" de ")
                .append(rdaItems.size())
                .append(".");
        return builder.toString();
    }

    private List<String> construirRecomendaciones(
            List<SimulationStateResponse> estados,
            List<RdaEvaluationItemResponse> pendientes,
            List<AttemptConsequenceResponse> consecuencias) {
        List<String> recomendaciones = new ArrayList<>();
        estados.stream()
                .filter(estado -> CHALLENGE_STATES.contains(estado.nombre()) && estado.valorActual() >= CHALLENGE_THRESHOLD)
                .forEach(estado -> recomendaciones.add(
                        "Refuerce estrategias para modular " + estado.nombre().toLowerCase()
                                + " (valor actual " + estado.valorActual() + "%)."));
        pendientes.stream()
                .limit(3)
                .forEach(rda -> recomendaciones.add(
                        "Trabaje el RDA " + rda.orden() + ": " + rda.descripcion()));
        if (consecuencias.isEmpty()) {
            recomendaciones.add("Complete escenarios con decisiones vinculadas a consecuencias clinicas documentadas.");
        }
        if (recomendaciones.isEmpty()) {
            recomendaciones.add("Mantenga el nivel de desempeno y profundice en casos de mayor complejidad.");
        }
        return recomendaciones;
    }
}
