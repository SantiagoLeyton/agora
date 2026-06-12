package com.agora.modules.simulation.dto;

import java.math.BigDecimal;

public record RdaEvaluationItemResponse(
        Long rdaId,
        Integer orden,
        String descripcion,
        BigDecimal puntosObtenidos,
        BigDecimal puntosMaximos,
        BigDecimal compliancePct,
        BigDecimal nota,
        RdaComplianceStatus estado,
        int preguntasEvaluadas,
        int preguntasTotales) {
}
