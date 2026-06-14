package com.agora.modules.gradebook.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record GradebookHistoryItemResponse(
        Long attemptId,
        Instant fechaPresentacion,
        String estado,
        BigDecimal notaFinal) {
}
