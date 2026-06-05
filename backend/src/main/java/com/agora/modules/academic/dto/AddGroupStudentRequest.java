package com.agora.modules.academic.dto;

import jakarta.validation.constraints.NotNull;

public record AddGroupStudentRequest(
        @NotNull(message = "El estudiante es obligatorio")
        Long estudianteId) {
}
