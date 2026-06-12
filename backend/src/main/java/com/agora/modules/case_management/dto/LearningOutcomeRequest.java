package com.agora.modules.case_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LearningOutcomeRequest(
        @NotNull Integer orden,
        @NotBlank @Size(max = 500) String descripcion) {
}
