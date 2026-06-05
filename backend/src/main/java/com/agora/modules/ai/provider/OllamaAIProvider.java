package com.agora.modules.ai.provider;

import com.agora.modules.ai.config.OllamaProperties;
import com.agora.modules.ai.port.AIProvider;
import com.agora.modules.ai.port.AIProviderRequest;
import com.agora.modules.ai.port.AIProviderResult;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class OllamaAIProvider implements AIProvider {

    private final OllamaProperties properties;
    private final RestClient restClient;

    @Autowired
    public OllamaAIProvider(OllamaProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory(properties.timeoutSeconds()))
                .build();
    }

    OllamaAIProvider(OllamaProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    @Override
    public AIProviderResult generateSummary(AIProviderRequest request) {
        long started = System.nanoTime();
        log.info("ai.provider=ollama event=generation_started attemptId={} model={}",
                request.intentoId(), properties.model());
        try {
            OllamaGenerateResponse response = restClient.post()
                    .uri("/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new OllamaGenerateRequest(properties.model(), request.prompt(), false))
                    .retrieve()
                    .body(OllamaGenerateResponse.class);
            String generated = response == null ? null : response.response();
            if (generated == null || generated.isBlank()) {
                throw new IllegalStateException("Ollama devolvio una respuesta vacia");
            }
            log.info("ai.provider=ollama event=generation_succeeded attemptId={} model={} elapsedMs={}",
                    request.intentoId(), model(response), elapsedMs(started));
            return new AIProviderResult(generated.trim(), model(response));
        } catch (RuntimeException exception) {
            log.warn("ai.provider=ollama event=generation_failed attemptId={} model={} elapsedMs={} error={}",
                    request.intentoId(), properties.model(), elapsedMs(started), exception.getClass().getSimpleName());
            throw exception;
        }
    }

    private SimpleClientHttpRequestFactory requestFactory(Integer timeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        int timeout = (int) Duration.ofSeconds(timeoutSeconds == null ? 60 : timeoutSeconds).toMillis();
        factory.setConnectTimeout(timeout);
        factory.setReadTimeout(timeout);
        return factory;
    }

    private String model(OllamaGenerateResponse response) {
        return response.model() == null || response.model().isBlank() ? properties.model() : response.model();
    }

    private long elapsedMs(long started) {
        return Duration.ofNanos(System.nanoTime() - started).toMillis();
    }

    private record OllamaGenerateRequest(
            String model,
            String prompt,
            boolean stream) {
    }

    private record OllamaGenerateResponse(
            String model,
            String response,
            boolean done) {
    }
}
