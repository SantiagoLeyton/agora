package com.agora.modules.simulation.dto;

import java.math.BigDecimal;
import java.util.List;

public record PedagogicalAnalysisResponse(
        Long attemptId,
        String retroalimentacionClinica,
        String retroalimentacionPedagogica,
        List<String> recomendaciones,
        List<RdaEvaluationItemResponse> rdaAlcanzados,
        List<RdaEvaluationItemResponse> rdaPendientes,
        List<AttemptConsequenceResponse> consecuenciasAcumuladas,
        List<SimulationStateResponse> estadosFinales,
        BigDecimal notaFinal) {
}
