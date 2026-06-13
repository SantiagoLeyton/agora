package com.agora.modules.simulation.dto;

import java.util.List;

public record AnswerResponse(
        Long respuestaId,
        Long intentoId,
        Long preguntaId,
        Long opcionId,
        String mensaje,
        ConsequenceDetailResponse consecuencia,
        List<SimulationStateResponse> estados) {
}
