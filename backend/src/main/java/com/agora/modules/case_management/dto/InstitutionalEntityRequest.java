package com.agora.modules.case_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InstitutionalEntityRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
        String nombre,
        @NotBlank(message = "El tipo es obligatorio")
        @Size(max = 80, message = "El tipo no puede superar 80 caracteres")
        String tipo,
        @Size(max = 1000, message = "La descripcion no puede superar 1000 caracteres")
        String descripcion,
        Boolean activo) {
}
