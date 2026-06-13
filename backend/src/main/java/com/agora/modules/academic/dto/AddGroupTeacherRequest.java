package com.agora.modules.academic.dto;

import jakarta.validation.constraints.NotNull;

public record AddGroupTeacherRequest(
        @NotNull(message = "El docente es obligatorio")
        Long docenteId) {
}
