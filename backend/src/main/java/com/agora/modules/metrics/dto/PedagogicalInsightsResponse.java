package com.agora.modules.metrics.dto;

import java.util.List;

public record PedagogicalInsightsResponse(
        Double averageGrade,
        List<RdaAggregateMetric> rdaSummary,
        List<StudentProgressMetric> studentsRequiringAttention,
        List<StudentProgressMetric> positiveProgressStudents) {

    public record RdaAggregateMetric(String descripcion, double avgCompliancePct, int sampleSize) {
    }

    public record StudentProgressMetric(
            long studentId,
            String studentName,
            Double latestGrade,
            Double gradeTrend) {
    }
}
