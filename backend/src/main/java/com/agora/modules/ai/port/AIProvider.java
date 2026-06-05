package com.agora.modules.ai.port;

public interface AIProvider {

    AIProviderResult generateSummary(AIProviderRequest request);
}
