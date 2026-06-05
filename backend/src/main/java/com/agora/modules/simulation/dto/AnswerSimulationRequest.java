package com.agora.modules.simulation.dto;

import jakarta.validation.constraints.NotNull;

public record AnswerSimulationRequest(
        @NotNull(message = "La pregunta es obligatoria")
        Long preguntaId,
        @NotNull(message = "La opcion es obligatoria")
        Long opcionId) {
}
