package com.agora.modules.metrics.service;

import com.agora.modules.ai.repository.SintesisIaRepository;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.SimulationStatus;
import com.agora.modules.simulation.dto.AcademicProgressResponse;
import com.agora.modules.simulation.dto.AcademicProgressResponse.AttemptProgressPoint;
import com.agora.modules.simulation.dto.AcademicProgressResponse.RdaTrendPoint;
import com.agora.modules.simulation.dto.AcademicProgressResponse.RdaTrendSample;
import com.agora.modules.simulation.dto.RdaComplianceStatus;
import com.agora.modules.simulation.dto.RdaEvaluationItemResponse;
import com.agora.modules.simulation.dto.SimulationStateResponse;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.modules.simulation.service.AttemptAccessService;
import com.agora.modules.simulation.service.RdaEvaluationService;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PedagogicalAnalyticsService {

    private final IntentoRepository intentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstadoIntentoRepository estadoIntentoRepository;
    private final RetroalimentacionRepository retroalimentacionRepository;
    private final SintesisIaRepository sintesisIaRepository;
    private final AttemptAccessService accessService;
    private final RdaEvaluationService rdaEvaluationService;

    @Transactional(readOnly = true)
    public AcademicProgressResponse progresoPropio(UserPrincipal principal) {
        if (!"ESTUDIANTE".equals(principal.rol())) {
            throw new AccessDeniedException("Solo estudiantes pueden consultar su progreso personal");
        }
        return buildProgress(principal.id(), principal);
    }

    @Transactional(readOnly = true)
    public AcademicProgressResponse progresoEstudiante(Long studentId, UserPrincipal principal) {
        validarAccesoEstudiante(studentId, principal);
        return buildProgress(studentId, principal);
    }

    private AcademicProgressResponse buildProgress(Long studentId, UserPrincipal principal) {
        Usuario student = usuarioRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado"));

        List<Intento> attempts = intentoRepository
                .findByEstudianteId(studentId, PageRequest.of(0, 100, Sort.by(Sort.Direction.ASC, "fechaInicio")))
                .getContent()
                .stream()
                .filter(attempt -> attempt.getEstado() == SimulationStatus.FINALIZADO)
                .toList();

        for (Intento attempt : attempts) {
            accessService.validarLectura(attempt, principal);
        }

        List<AttemptProgressPoint> points = new ArrayList<>();
        Map<Long, List<RdaTrendSample>> samplesByRda = new LinkedHashMap<>();
        Map<Long, String> descriptionsByRda = new LinkedHashMap<>();

        for (Intento attempt : attempts) {
            List<RdaEvaluationItemResponse> rdaEvaluations =
                    rdaEvaluationService.evaluarCaso(attempt.getCaso().getId(), attempt.getId());

            for (RdaEvaluationItemResponse evaluation : rdaEvaluations) {
                descriptionsByRda.putIfAbsent(evaluation.rdaId(), evaluation.descripcion());
                samplesByRda.computeIfAbsent(evaluation.rdaId(), id -> new ArrayList<>())
                        .add(new RdaTrendSample(
                                attempt.getId(),
                                attempt.getFechaFin(),
                                evaluation.compliancePct(),
                                evaluation.estado()));
            }

            points.add(new AttemptProgressPoint(
                    attempt.getId(),
                    attempt.getCaso().getId(),
                    attempt.getCaso().getTitulo(),
                    attempt.getFechaFin(),
                    attempt.getNotaFinal(),
                    retroalimentacionRepository.findByIntentoIdOrderByFechaGeneracionAsc(attempt.getId()).size(),
                    sintesisIaRepository.findByIntentoIdOrderByFechaGeneracionDesc(attempt.getId()).size(),
                    rdaEvaluations,
                    estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(attempt.getId()).stream()
                            .map(SimulationStateResponse::from)
                            .toList()));
        }

        List<RdaTrendPoint> trends = samplesByRda.entrySet().stream()
                .map(entry -> new RdaTrendPoint(
                        entry.getKey(),
                        descriptionsByRda.get(entry.getKey()),
                        entry.getValue()))
                .toList();

        String studentName = ("%s %s".formatted(student.getNombre(), student.getApellido())).trim();
        return new AcademicProgressResponse(studentId, studentName, points, trends);
    }

    private void validarAccesoEstudiante(Long studentId, UserPrincipal principal) {
        if ("ADMINISTRADOR".equals(principal.rol()) || "DOCENTE_ADMIN".equals(principal.rol())) {
            return;
        }
        if ("DOCENTE".equals(principal.rol())) {
            boolean visible = intentoRepository.findByEstudianteId(studentId, PageRequest.of(0, 1)).stream()
                    .anyMatch(attempt -> attempt.getProgramacion() != null
                            && attempt.getProgramacion().getDocente().getId().equals(principal.id()));
            if (visible) {
                return;
            }
        }
        if ("ESTUDIANTE".equals(principal.rol()) && studentId.equals(principal.id())) {
            return;
        }
        throw new AccessDeniedException("No tiene permiso para consultar el progreso de este estudiante");
    }
}
