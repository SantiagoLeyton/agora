package com.agora.modules.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,
        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 100, message = "El apellido no puede superar 100 caracteres")
        String apellido,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato valido")
        @Size(max = 255, message = "El correo no puede superar 255 caracteres")
        String correo,
        @NotBlank(message = "El password temporal es obligatorio")
        @Size(min = 8, max = 72, message = "El password debe tener entre 8 y 72 caracteres")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$",
                message = "El password debe incluir mayuscula, minuscula, numero y simbolo")
        String passwordTemporal,
        @NotBlank(message = "El rol es obligatorio")
        String rol) {
}
