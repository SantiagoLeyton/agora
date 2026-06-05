package com.agora.modules.simulation.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateFeedbackRequest(
        @NotBlank(message = "El contenido es obligatorio")
        String contenido,
        String observaciones) {
}
