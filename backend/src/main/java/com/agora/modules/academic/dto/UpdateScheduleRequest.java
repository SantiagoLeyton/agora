package com.agora.modules.academic.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record UpdateScheduleRequest(
        @NotNull(message = "El grupo es obligatorio")
        Long grupoId,
        Long casoId,
        @NotNull(message = "La fecha de inicio es obligatoria")
        Instant fechaInicio,
        @NotNull(message = "La fecha de fin es obligatoria")
        Instant fechaFin,
        @NotNull(message = "El estado activo es obligatorio")
        Boolean activo,
        Long estudianteId) {
}
