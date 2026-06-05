package com.agora.modules.ai.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.agora.modules.ai.port.AIProviderRequest;
import org.junit.jupiter.api.Test;

class MockAIProviderTest {

    private final MockAIProvider provider = new MockAIProvider();

    @Test
    void generatesDeterministicSummary() {
        var result = provider.generateSummary(new AIProviderRequest(1L, "prompt"));

        assertThat(result.model()).isEqualTo(MockAIProvider.MODEL);
        assertThat(result.response()).contains("MockAIProvider");
    }

    @Test
    void supportsControlledFailureForFallbackValidation() {
        assertThatThrownBy(() -> provider.generateSummary(new AIProviderRequest(1L, "FORZAR_ERROR_MOCK")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Fallo controlado");
    }
}
