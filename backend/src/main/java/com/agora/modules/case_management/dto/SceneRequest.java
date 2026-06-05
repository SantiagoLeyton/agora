package com.agora.modules.case_management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SceneRequest(
        @NotNull(message = "El orden es obligatorio")
        @Min(value = 1, message = "El orden debe ser mayor a cero")
        Integer orden,
        @NotBlank(message = "El titulo es obligatorio")
        @Size(max = 150, message = "El titulo no puede superar 150 caracteres")
        String titulo,
        @Size(max = 1000, message = "La descripcion no puede superar 1000 caracteres")
        String descripcion,
        @NotBlank(message = "El contenido es obligatorio")
        String contenido,
        Boolean activo) {
}
