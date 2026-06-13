package com.agora.modules.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinGroupRequest(
        @NotBlank(message = "La clave de acceso es obligatoria")
        @Size(min = 4, max = 32, message = "La clave debe tener entre 4 y 32 caracteres")
        String claveAcceso) {
}
