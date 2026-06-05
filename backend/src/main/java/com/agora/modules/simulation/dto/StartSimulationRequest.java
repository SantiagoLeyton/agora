package com.agora.modules.simulation.dto;

import jakarta.validation.constraints.NotNull;

public record StartSimulationRequest(
        @NotNull(message = "El caso es obligatorio")
        Long casoId,
        Long programacionId) {
}
