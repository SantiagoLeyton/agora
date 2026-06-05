package com.agora.modules.case_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuestionRequest(
        @NotBlank(message = "El enunciado es obligatorio")
        @Size(max = 1000, message = "El enunciado no puede superar 1000 caracteres")
        String enunciado,
        Boolean obligatoria,
        Boolean activo) {
}
