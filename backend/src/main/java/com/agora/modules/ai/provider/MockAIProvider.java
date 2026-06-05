package com.agora.modules.ai.provider;

import com.agora.modules.ai.port.AIProvider;
import com.agora.modules.ai.port.AIProviderRequest;
import com.agora.modules.ai.port.AIProviderResult;
import org.springframework.stereotype.Component;

@Component
public class MockAIProvider implements AIProvider {

    public static final String MODEL = "mock-ai-provider-v1";

    @Override
    public AIProviderResult generateSummary(AIProviderRequest request) {
        if (request.prompt().contains("FORZAR_ERROR_MOCK")) {
            throw new IllegalStateException("Fallo controlado del proveedor mock");
        }
        return new AIProviderResult("La simulacion finalizo con una lectura academica basada en los estados "
                + "emocionales y las respuestas registradas. Esta sintesis fue generada por el proveedor "
                + "MockAIProvider.", MODEL);
    }
}
