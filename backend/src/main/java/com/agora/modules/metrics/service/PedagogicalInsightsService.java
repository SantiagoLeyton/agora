package com.agora.modules.metrics.service;

import com.agora.modules.metrics.dto.PedagogicalInsightsResponse;
import com.agora.modules.metrics.dto.PedagogicalInsightsResponse.RdaAggregateMetric;
import com.agora.modules.metrics.dto.PedagogicalInsightsResponse.StudentProgressMetric;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.SimulationStatus;
import com.agora.modules.simulation.dto.RdaEvaluationItemResponse;
import com.agora.modules.simulation.service.RdaEvaluationService;
import com.agora.modules.user.domain.Usuario;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PedagogicalInsightsService {

    private final RdaEvaluationService rdaEvaluationService;

    public PedagogicalInsightsResponse build(List<Intento> attempts) {
        List<Intento> finalized = attempts.stream()
                .filter(attempt -> attempt.getEstado() == SimulationStatus.FINALIZADO)
                .toList();

        var gradeAverage = finalized.stream()
                .map(Intento::getNotaFinal)
                .filter(nota -> nota != null)
                .mapToDouble(BigDecimal::doubleValue)
                .average();
        Double averageGrade = gradeAverage.isPresent()
                ? Math.round(gradeAverage.getAsDouble() * 10D) / 10D
                : null;

        Map<String, List<BigDecimal>> complianceByRda = new HashMap<>();
        for (Intento attempt : finalized) {
            List<RdaEvaluationItemResponse> evaluations =
                    rdaEvaluationService.evaluarCaso(attempt.getCaso().getId(), attempt.getId());
            for (RdaEvaluationItemResponse evaluation : evaluations) {
                complianceByRda
                        .computeIfAbsent(evaluation.descripcion(), key -> new ArrayList<>())
                        .add(evaluation.compliancePct());
            }
        }

        List<RdaAggregateMetric> rdaSummary = complianceByRda.entrySet().stream()
                .map(entry -> {
                    double avg = entry.getValue().stream()
                            .mapToDouble(BigDecimal::doubleValue)
                            .average()
                            .orElse(0D);
                    return new RdaAggregateMetric(entry.getKey(), Math.round(avg * 10D) / 10D, entry.getValue().size());
                })
                .sorted(Comparator.comparingDouble(RdaAggregateMetric::avgCompliancePct).reversed())
                .toList();

        Map<Long, List<Intento>> attemptsByStudent = finalized.stream()
                .collect(Collectors.groupingBy(attempt -> attempt.getEstudiante().getId()));

        List<StudentProgressMetric> progressMetrics = attemptsByStudent.entrySet().stream()
                .map(entry -> buildStudentMetric(entry.getKey(), entry.getValue()))
                .toList();

        List<StudentProgressMetric> requiringAttention = progressMetrics.stream()
                .filter(metric -> metric.latestGrade() != null && metric.latestGrade() < 3.0)
                .sorted(Comparator.comparingDouble(StudentProgressMetric::latestGrade))
                .limit(5)
                .toList();

        List<StudentProgressMetric> positiveProgress = progressMetrics.stream()
                .filter(metric -> metric.gradeTrend() != null && metric.gradeTrend() > 0)
                .sorted(Comparator.comparingDouble(StudentProgressMetric::gradeTrend).reversed())
                .limit(5)
                .toList();

        return new PedagogicalInsightsResponse(averageGrade, rdaSummary, requiringAttention, positiveProgress);
    }

    private StudentProgressMetric buildStudentMetric(Long studentId, List<Intento> attempts) {
        List<Intento> ordered = attempts.stream()
                .sorted(Comparator.comparing(
                        attempt -> attempt.getFechaFin() == null ? attempt.getFechaInicio() : attempt.getFechaFin()))
                .toList();
        Usuario student = ordered.getLast().getEstudiante();
        String name = ("%s %s".formatted(student.getNombre(), student.getApellido())).trim();

        Double latestGrade = ordered.getLast().getNotaFinal() == null
                ? null
                : ordered.getLast().getNotaFinal().doubleValue();

        Double trend = null;
        if (ordered.size() >= 2) {
            BigDecimal previous = ordered.get(ordered.size() - 2).getNotaFinal();
            BigDecimal latest = ordered.getLast().getNotaFinal();
            if (previous != null && latest != null) {
                trend = Math.round((latest.doubleValue() - previous.doubleValue()) * 10D) / 10D;
            }
        }

        return new StudentProgressMetric(studentId, name, latestGrade, trend);
    }
}
