package com.agora.modules.metrics.service;

import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.repository.GrupoEstudianteRepository;
import com.agora.modules.academic.repository.GrupoRepository;
import com.agora.modules.academic.repository.ProgramacionRepository;
import com.agora.modules.ai.repository.SintesisIaRepository;
import com.agora.modules.metrics.dto.TeacherMetricsResponse;
import com.agora.modules.metrics.dto.TeacherMetricsResponse.EmotionalProfileMetric;
import com.agora.modules.metrics.dto.TeacherMetricsResponse.GroupMetrics;
import com.agora.modules.metrics.dto.TeacherMetricsResponse.MetricsMetadata;
import com.agora.modules.metrics.dto.TeacherMetricsResponse.MostPracticedCase;
import com.agora.modules.metrics.dto.TeacherMetricsResponse.OverviewMetrics;
import com.agora.modules.metrics.dto.TeacherMetricsResponse.ParticipationMetrics;
import com.agora.modules.metrics.dto.TeacherMetricsResponse.SemesterSummaryMetrics;
import com.agora.modules.simulation.domain.EstadoIntento;
import com.agora.modules.simulation.domain.FeedbackAuthor;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.SimulationStatus;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherMetricsService {

    private static final int ELEVATED_THRESHOLD = 60;
    private static final String ACADEMIC_NOTICE =
            "Los indicadores emocionales provienen del simulador. No constituyen evaluacion clinica ni diagnostico.";
    private static final List<String> EMOTIONAL_STATE_ORDER =
            List.of("ANSIEDAD", "ESTRES", "CONFIANZA", "COOPERACION", "RESISTENCIA");
    private static final Set<String> POSITIVE_STATES = Set.of("CONFIANZA", "COOPERACION");
    private static final Set<String> CHALLENGE_STATES = Set.of("ANSIEDAD", "ESTRES", "RESISTENCIA");

    private final GrupoRepository grupoRepository;
    private final GrupoEstudianteRepository grupoEstudianteRepository;
    private final ProgramacionRepository programacionRepository;
    private final IntentoRepository intentoRepository;
    private final EstadoIntentoRepository estadoIntentoRepository;
    private final RetroalimentacionRepository retroalimentacionRepository;
    private final RespuestaRepository respuestaRepository;
    private final BitacoraRepository bitacoraRepository;
    private final SintesisIaRepository sintesisIaRepository;
    private final PedagogicalInsightsService pedagogicalInsightsService;

    @Transactional(readOnly = true)
    public TeacherMetricsResponse obtener(String periodo, Long grupoId, UserPrincipal principal) {
        boolean isAdmin = "ADMINISTRADOR".equals(principal.rol())
                || "DOCENTE_ADMIN".equals(principal.rol());
        Long docenteId = isAdmin ? null : principal.id();
        List<Grupo> groups = grupoRepository.findAll(filterGroups(docenteId, periodo, grupoId));
        List<Intento> attempts = isAdmin
                ? intentoRepository.findForTeacherMetricsAdmin(periodo, grupoId)
                : intentoRepository.findForTeacherMetricsByDocente(docenteId, periodo, grupoId);
        List<Long> attemptIds = attempts.stream().map(Intento::getId).toList();

        Map<Long, List<EstadoIntento>> statesByAttempt = loadStatesByAttempt(attemptIds);
        Set<Long> attemptsWithTeacherFeedback = loadAttemptsWithTeacherFeedback(attemptIds);

        int enrolledParticipants = groups.stream()
                .mapToInt(group -> grupoEstudianteRepository.findByGrupoIdOrderByFechaIngresoAsc(group.getId()).size())
                .sum();

        int activeSchedules = (isAdmin
                        ? programacionRepository.findActiveForMetricsAdmin(periodo, grupoId, Instant.now())
                        : programacionRepository.findActiveForMetricsByDocente(
                                docenteId, periodo, grupoId, Instant.now()))
                .size();

        int completedAttempts = countByStatus(attempts, SimulationStatus.FINALIZADO);
        int inProgressAttempts = countByStatus(attempts, SimulationStatus.EN_PROCESO);
        int abandonedAttempts = countByStatus(attempts, SimulationStatus.ABANDONADO);
        int totalAttempts = attempts.size();
        double completionRate = totalAttempts == 0 ? 0D : (completedAttempts * 100D) / totalAttempts;

        int pendingFeedback = (int) attempts.stream()
                .filter(attempt -> attempt.getEstado() == SimulationStatus.FINALIZADO)
                .filter(attempt -> !attemptsWithTeacherFeedback.contains(attempt.getId()))
                .count();

        int elevatedIndicators = countElevatedParticipants(attempts, statesByAttempt);

        List<EmotionalProfileMetric> emotionalProfile =
                buildEmotionalProfile(attempts, statesByAttempt, SimulationStatus.FINALIZADO);

        List<GroupMetrics> byGroup = groups.stream()
                .map(group -> buildGroupMetrics(group, attempts, statesByAttempt))
                .toList();

        SemesterSummaryMetrics semesterSummary = buildSemesterSummary(attempts);
        ParticipationMetrics participation = buildParticipationMetrics(attemptIds);
        var pedagogicalInsights = pedagogicalInsightsService.build(attempts);

        return new TeacherMetricsResponse(
                new OverviewMetrics(
                        enrolledParticipants,
                        activeSchedules,
                        round(completionRate),
                        pendingFeedback,
                        elevatedIndicators,
                        completedAttempts,
                        inProgressAttempts,
                        abandonedAttempts),
                emotionalProfile,
                byGroup,
                semesterSummary,
                participation,
                pedagogicalInsights,
                new MetricsMetadata(periodo, Instant.now(), completedAttempts, ACADEMIC_NOTICE));
    }

    private Specification<Grupo> filterGroups(Long docenteId, String periodo, Long grupoId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("activo")));
            if (docenteId != null) {
                predicates.add(cb.equal(root.get("docente").get("id"), docenteId));
            }
            if (periodo != null && !periodo.isBlank()) {
                predicates.add(cb.equal(root.get("periodo"), periodo));
            }
            if (grupoId != null) {
                predicates.add(cb.equal(root.get("id"), grupoId));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Map<Long, List<EstadoIntento>> loadStatesByAttempt(List<Long> attemptIds) {
        if (attemptIds.isEmpty()) {
            return Map.of();
        }
        return estadoIntentoRepository.findByIntentoIdIn(attemptIds).stream()
                .collect(Collectors.groupingBy(state -> state.getIntento().getId()));
    }

    private Set<Long> loadAttemptsWithTeacherFeedback(List<Long> attemptIds) {
        if (attemptIds.isEmpty()) {
            return Set.of();
        }
        return retroalimentacionRepository.findByIntentoIdIn(attemptIds).stream()
                .filter(feedback -> feedback.getAutor() == FeedbackAuthor.DOCENTE)
                .map(feedback -> feedback.getIntento().getId())
                .collect(Collectors.toSet());
    }

    private int countByStatus(List<Intento> attempts, SimulationStatus status) {
        return (int) attempts.stream().filter(attempt -> attempt.getEstado() == status).count();
    }

    private int countElevatedParticipants(List<Intento> attempts, Map<Long, List<EstadoIntento>> statesByAttempt) {
        Map<Long, Intento> latestFinalizedByStudent = attempts.stream()
                .filter(attempt -> attempt.getEstado() == SimulationStatus.FINALIZADO)
                .collect(Collectors.toMap(
                        attempt -> attempt.getEstudiante().getId(),
                        attempt -> attempt,
                        (left, right) -> compareFinalizedAttempts(left, right) >= 0 ? left : right));

        int elevated = 0;
        for (Intento attempt : latestFinalizedByStudent.values()) {
            if (hasElevatedIndicators(statesByAttempt.getOrDefault(attempt.getId(), List.of()))) {
                elevated++;
            }
        }
        return elevated;
    }

    private int compareFinalizedAttempts(Intento left, Intento right) {
        Instant leftEnd = left.getFechaFin() == null ? left.getFechaInicio() : left.getFechaFin();
        Instant rightEnd = right.getFechaFin() == null ? right.getFechaInicio() : right.getFechaFin();
        return leftEnd.compareTo(rightEnd);
    }

    private boolean hasElevatedIndicators(List<EstadoIntento> states) {
        return states.stream().anyMatch(state -> {
            String name = state.getEstadoEmocional().getNombre();
            return CHALLENGE_STATES.contains(name) && state.getValorActual() >= ELEVATED_THRESHOLD;
        });
    }

    private List<EmotionalProfileMetric> buildEmotionalProfile(
            List<Intento> attempts,
            Map<Long, List<EstadoIntento>> statesByAttempt,
            SimulationStatus requiredStatus) {
        Map<String, List<Integer>> valuesByState = new HashMap<>();
        for (Intento attempt : attempts) {
            if (attempt.getEstado() != requiredStatus) {
                continue;
            }
            for (EstadoIntento state : statesByAttempt.getOrDefault(attempt.getId(), List.of())) {
                valuesByState
                        .computeIfAbsent(state.getEstadoEmocional().getNombre(), key -> new ArrayList<>())
                        .add(state.getValorActual());
            }
        }

        return EMOTIONAL_STATE_ORDER.stream()
                .map(stateName -> {
                    List<Integer> values = valuesByState.getOrDefault(stateName, List.of());
                    double average = values.isEmpty()
                            ? 0D
                            : values.stream().mapToInt(Integer::intValue).average().orElse(0D);
                    return new EmotionalProfileMetric(stateName, round(average), values.size());
                })
                .toList();
    }

    private GroupMetrics buildGroupMetrics(
            Grupo group,
            List<Intento> attempts,
            Map<Long, List<EstadoIntento>> statesByAttempt) {
        int studentsCount = grupoEstudianteRepository.findByGrupoIdOrderByFechaIngresoAsc(group.getId()).size();
        List<Intento> groupAttempts = attempts.stream()
                .filter(attempt -> attempt.getProgramacion() != null)
                .filter(attempt -> Objects.equals(attempt.getProgramacion().getGrupo().getId(), group.getId()))
                .toList();

        Set<Long> participatingStudents = groupAttempts.stream()
                .map(attempt -> attempt.getEstudiante().getId())
                .collect(Collectors.toSet());

        int groupCompleted = countByStatus(groupAttempts, SimulationStatus.FINALIZADO);
        double participationRate =
                studentsCount == 0 ? 0D : (participatingStudents.size() * 100D) / studentsCount;
        double completionRate = groupAttempts.isEmpty() ? 0D : (groupCompleted * 100D) / groupAttempts.size();

        List<EmotionalProfileMetric> groupProfile =
                buildEmotionalProfile(groupAttempts, statesByAttempt, SimulationStatus.FINALIZADO);

        String strength = groupProfile.stream()
                .filter(metric -> POSITIVE_STATES.contains(metric.name()))
                .max(Comparator.comparingDouble(EmotionalProfileMetric::average))
                .filter(metric -> metric.sampleSize() > 0)
                .map(metric -> metric.name() + " simulada")
                .orElse(null);

        String attentionArea = groupProfile.stream()
                .filter(metric -> CHALLENGE_STATES.contains(metric.name()))
                .max(Comparator.comparingDouble(EmotionalProfileMetric::average))
                .filter(metric -> metric.sampleSize() > 0 && metric.average() >= ELEVATED_THRESHOLD)
                .map(metric -> metric.name() + " simulada")
                .orElse(null);

        return new GroupMetrics(
                group.getId(),
                group.getNombre(),
                studentsCount,
                round(participationRate),
                round(completionRate),
                strength,
                attentionArea);
    }

    private SemesterSummaryMetrics buildSemesterSummary(List<Intento> attempts) {
        List<Intento> finalized = attempts.stream()
                .filter(attempt -> attempt.getEstado() == SimulationStatus.FINALIZADO)
                .toList();

        long averageDurationSeconds = 0L;
        if (!finalized.isEmpty()) {
            var stats = finalized.stream()
                    .filter(attempt -> attempt.getFechaFin() != null)
                    .mapToLong(attempt -> Duration.between(attempt.getFechaInicio(), attempt.getFechaFin()).getSeconds())
                    .summaryStatistics();
            averageDurationSeconds = stats.getCount() == 0 ? 0L : Math.round(stats.getAverage());
        }

        MostPracticedCase mostPracticedCase = finalized.stream()
                .collect(Collectors.groupingBy(attempt -> attempt.getCaso().getId(), Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> finalized.stream()
                        .filter(attempt -> attempt.getCaso().getId().equals(entry.getKey()))
                        .findFirst()
                        .map(attempt -> new MostPracticedCase(
                                attempt.getCaso().getId(),
                                attempt.getCaso().getTitulo(),
                                entry.getValue().intValue()))
                        .orElse(null))
                .orElse(null);

        return new SemesterSummaryMetrics(finalized.size(), averageDurationSeconds, mostPracticedCase);
    }

    private ParticipationMetrics buildParticipationMetrics(List<Long> attemptIds) {
        if (attemptIds.isEmpty()) {
            return new ParticipationMetrics(0, 0, 0);
        }

        int responsesCount = attemptIds.stream()
                .mapToInt(id -> respuestaRepository.findByIntentoId(id).size())
                .sum();
        int journalsCount = attemptIds.stream()
                .mapToInt(id -> bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(id).size())
                .sum();
        int aiSummariesCount = attemptIds.stream()
                .mapToInt(id -> sintesisIaRepository.findByIntentoIdOrderByFechaGeneracionDesc(id).size())
                .sum();

        return new ParticipationMetrics(responsesCount, journalsCount, aiSummariesCount);
    }

    private double round(double value) {
        return Math.round(value * 10D) / 10D;
    }
}
