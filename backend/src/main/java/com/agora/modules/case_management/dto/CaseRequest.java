package com.agora.modules.case_management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CaseRequest(
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 150, message = "El titulo no puede superar 150 caracteres")
        String titulo,
        @Size(max = 1000, message = "La descripcion no puede superar 1000 caracteres")
        String descripcion,
        @Size(max = 1000, message = "El objetivo no puede superar 1000 caracteres")
        String objetivo,
        @NotBlank(message = "El nivel de dificultad es obligatorio")
        @Size(max = 50, message = "El nivel de dificultad no puede superar 50 caracteres")
        String nivelDificultad,
        @NotNull(message = "La duracion estimada es obligatoria")
        @Min(value = 1, message = "La duracion estimada debe ser mayor a cero")
        Integer duracionEstimada) {
}
