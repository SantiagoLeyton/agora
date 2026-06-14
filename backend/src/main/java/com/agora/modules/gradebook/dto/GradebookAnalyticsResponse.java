package com.agora.modules.gradebook.dto;

import java.math.BigDecimal;
import java.util.List;

public record GradebookAnalyticsResponse(
        BigDecimal promedioCurso,
        BigDecimal mejorNota,
        BigDecimal peorNota,
        long aprobados,
        long reprobados,
        BigDecimal umbralAprobacion,
        List<GradeDistributionItem> distribucion) {
}
