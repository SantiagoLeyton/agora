package com.agora.modules.simulation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AcademicProgressResponse(
        Long studentId,
        String studentName,
        List<AttemptProgressPoint> attempts,
        List<RdaTrendPoint> rdaTrends) {

    public record AttemptProgressPoint(
            Long attemptId,
            Long casoId,
            String casoTitulo,
            Instant fechaFin,
            BigDecimal notaFinal,
            int feedbackCount,
            int aiSummaryCount,
            List<RdaEvaluationItemResponse> rdaEvaluations,
            List<SimulationStateResponse> estados) {
    }

    public record RdaTrendPoint(
            Long rdaId,
            String descripcion,
            List<RdaTrendSample> samples) {
    }

    public record RdaTrendSample(Long attemptId, Instant fechaFin, BigDecimal compliancePct, RdaComplianceStatus estado) {
    }
}
