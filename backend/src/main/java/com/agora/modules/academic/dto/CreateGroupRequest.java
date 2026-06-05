package com.agora.modules.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,
        @Size(max = 500, message = "La descripcion no puede superar 500 caracteres")
        String descripcion,
        @NotBlank(message = "El periodo es obligatorio")
        @Size(max = 50, message = "El periodo no puede superar 50 caracteres")
        String periodo) {
}
