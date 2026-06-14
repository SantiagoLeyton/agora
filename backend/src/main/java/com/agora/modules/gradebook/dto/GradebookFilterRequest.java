package com.agora.modules.gradebook.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record GradebookFilterRequest(
        Long grupoId,
        Long casoId,
        Long estudianteId,
        Instant desde,
        Instant hasta,
        String estado,
        BigDecimal notaMinima,
        BigDecimal notaMaxima) {
}
