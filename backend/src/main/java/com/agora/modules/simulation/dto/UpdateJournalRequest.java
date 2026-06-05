package com.agora.modules.simulation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateJournalRequest(
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 150, message = "El titulo no puede superar 150 caracteres")
        String titulo,
        @NotBlank(message = "El contenido es obligatorio")
        String contenido) {
}
