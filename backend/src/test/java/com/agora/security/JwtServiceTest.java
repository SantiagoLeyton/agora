package com.agora.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET =
            "VGhpcy1pcy1hLXRlc3Qtc2VjcmV0LWZvci1BZ29yYS1KV1QtMjAyNi1vbmx5";

    @Test
    void generatesAndValidatesAccessToken() {
        JwtProperties properties = new JwtProperties(SECRET, 900, 604800);
        JwtService service = new JwtService(properties,
                Clock.fixed(Instant.parse("2026-06-04T12:00:00Z"), ZoneOffset.UTC));
        UserPrincipal principal = new UserPrincipal(1L, "Ada", "Lovelace", "ada@agora.com",
                "hash", "ESTUDIANTE", true);

        String token = service.generateAccessToken(principal);

        assertThat(service.extractUsername(token)).isEqualTo("ada@agora.com");
        assertThat(service.isValid(token, principal)).isTrue();
    }
}

