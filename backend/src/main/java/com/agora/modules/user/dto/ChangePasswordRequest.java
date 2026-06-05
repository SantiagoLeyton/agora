package com.agora.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "El nuevo password es obligatorio")
        @Size(min = 8, max = 72, message = "El password debe tener entre 8 y 72 caracteres")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$",
                message = "El password debe incluir mayuscula, minuscula, numero y simbolo")
        String password) {
}
