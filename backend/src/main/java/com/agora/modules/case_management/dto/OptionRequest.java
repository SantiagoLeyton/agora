package com.agora.modules.case_management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OptionRequest(
        @NotBlank(message = "El texto es obligatorio")
        @Size(max = 500, message = "El texto no puede superar 500 caracteres")
        String texto,
        @Size(max = 1000, message = "La descripcion no puede superar 1000 caracteres")
        String descripcion,
        @NotNull(message = "El orden es obligatorio")
        @Min(value = 1, message = "El orden debe ser mayor a cero")
        Integer orden,
        Boolean activo) {
}
