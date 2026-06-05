package com.agora.modules.ai.port;

public record AIProviderRequest(
        Long intentoId,
        String prompt) {
}
