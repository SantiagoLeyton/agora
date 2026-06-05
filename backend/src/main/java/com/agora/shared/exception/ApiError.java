package com.agora.shared.exception;

import java.time.Instant;
import java.util.Map;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estructura uniforme de errores de la API")
public record ApiError(
        @Schema(example = "2026-06-05T16:00:00Z")
        Instant timestamp,
        @Schema(example = "400")
        int status,
        @Schema(example = "Bad Request")
        String error,
        @Schema(example = "Solicitud invalida")
        String message,
        @Schema(example = "/api/v1/users")
        String path,
        @Schema(description = "Errores de validacion por campo, si aplica")
        Map<String, String> validationErrors) {
}
