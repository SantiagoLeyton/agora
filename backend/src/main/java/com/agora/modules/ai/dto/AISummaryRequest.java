package com.agora.modules.ai.dto;

import jakarta.validation.constraints.Size;

public record AISummaryRequest(
        @Size(max = 500, message = "Las instrucciones no pueden superar 500 caracteres")
        String instrucciones) {
}
