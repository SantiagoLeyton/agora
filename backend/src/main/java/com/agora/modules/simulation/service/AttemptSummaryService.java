package com.agora.modules.simulation.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.case_management.dto.CaseResponse;
import com.agora.modules.case_management.dto.LearningOutcomeResponse;
import com.agora.modules.case_management.repository.ResultadoAprendizajeRepository;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.dto.AttemptAnswerResponse;
import com.agora.modules.simulation.dto.AttemptResponse;
import com.agora.modules.simulation.dto.AttemptSummaryResponse;
import com.agora.modules.simulation.dto.FeedbackResponse;
import com.agora.modules.simulation.dto.JournalResponse;
import com.agora.modules.simulation.dto.SimulationStateResponse;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttemptSummaryService {

    private static final String MODULE = "SIMULATION";

    private final AttemptAccessService accessService;
    private final RespuestaRepository respuestaRepository;
    private final EstadoIntentoRepository estadoIntentoRepository;
    private final BitacoraRepository bitacoraRepository;
    private final RetroalimentacionRepository retroalimentacionRepository;
    private final ResultadoAprendizajeRepository resultadoRepository;
    private final OperationalAuditService auditService;

    @Transactional(readOnly = true)
    public AttemptSummaryResponse obtener(Long attemptId, UserPrincipal principal, String ip) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        Usuario actor = accessService.actor(principal);
        auditService.registrar(actor, "ATTEMPT_SUMMARY_VIEWED", MODULE, "Resumen consultado: intento " + attemptId, ip);
        var resultados = resultadoRepository.findByCasoIdOrderByOrdenAsc(intento.getCaso().getId()).stream()
                .map(LearningOutcomeResponse::from)
                .toList();
        return new AttemptSummaryResponse(AttemptResponse.from(intento),
                CaseResponse.from(intento.getCaso(), resultados),
                respuestaRepository.findByIntentoIdOrderByFechaRespuestaAsc(attemptId).stream()
                        .map(AttemptAnswerResponse::from)
                        .toList(),
                estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(attemptId).stream()
                        .map(SimulationStateResponse::from)
                        .toList(),
                bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(attemptId).stream()
                        .map(JournalResponse::from)
                        .toList(),
                retroalimentacionRepository.findByIntentoIdOrderByFechaGeneracionAsc(attemptId).stream()
                        .map(FeedbackResponse::from)
                        .toList());
    }
}
