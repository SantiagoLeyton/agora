package com.agora.modules.academic.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BatchGroupStudentsRequest(
        @NotEmpty(message = "Debe indicar al menos un estudiante")
        List<Long> estudianteIds) {
}
