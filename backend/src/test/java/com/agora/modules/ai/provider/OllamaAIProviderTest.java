package com.agora.modules.ai.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.agora.modules.ai.config.OllamaProperties;
import com.agora.modules.ai.port.AIProviderRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;

class OllamaAIProviderTest {

    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        restClientBuilder = RestClient.builder();
        server = MockRestServiceServer.bindTo(restClientBuilder).build();
    }

    @Test
    void generatesSummaryFromOllamaResponse() {
        server.expect(requestTo("http://ollama.test/api/generate"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("{\"model\":\"llama3.1:8b\",\"prompt\":\"prompt\",\"stream\":false}"))
                .andRespond(withSuccess("{\"model\":\"llama3.1:8b\",\"response\":\"Sintesis local\",\"done\":true}",
                        MediaType.APPLICATION_JSON));
        OllamaAIProvider provider = provider();

        var result = provider.generateSummary(new AIProviderRequest(1L, "prompt"));

        assertThat(result.model()).isEqualTo("llama3.1:8b");
        assertThat(result.response()).isEqualTo("Sintesis local");
        server.verify();
    }

    @Test
    void rejectsHttpErrors() {
        server.expect(requestTo("http://ollama.test/api/generate"))
                .andRespond(withServerError());
        OllamaAIProvider provider = provider();

        assertThatThrownBy(() -> provider.generateSummary(new AIProviderRequest(1L, "prompt")))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void rejectsInvalidEmptyResponse() {
        server.expect(requestTo("http://ollama.test/api/generate"))
                .andRespond(withSuccess("{\"model\":\"llama3.1:8b\",\"response\":\"\",\"done\":true}",
                        MediaType.APPLICATION_JSON));
        OllamaAIProvider provider = provider();

        assertThatThrownBy(() -> provider.generateSummary(new AIProviderRequest(1L, "prompt")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("respuesta vacia");
    }

    private OllamaAIProvider provider() {
        RestClient restClient = restClientBuilder.baseUrl("http://ollama.test").build();
        return new OllamaAIProvider(new OllamaProperties("http://ollama.test", "llama3.1:8b", 1),
                restClient);
    }
}
