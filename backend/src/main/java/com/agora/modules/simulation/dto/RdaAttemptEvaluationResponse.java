package com.agora.modules.simulation.dto;

import java.util.List;

public record RdaAttemptEvaluationResponse(Long attemptId, Long casoId, List<RdaEvaluationItemResponse> resultados) {
}
