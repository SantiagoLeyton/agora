package com.agora.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.agora.modules.auth.domain.RefreshToken;
import com.agora.modules.auth.repository.RefreshTokenRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.JwtProperties;
import com.agora.shared.exception.InvalidRefreshTokenException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository repository;

    private RefreshTokenService service;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-04T12:00:00Z"), ZoneOffset.UTC);
        service = new RefreshTokenService(repository, new JwtProperties("secret", 900, 604800), clock);
        usuario = new Usuario(new Rol("ESTUDIANTE", ""), "Ada", "Lovelace", "ada@agora.com", "hash");
    }

    @Test
    void createsValidRefreshToken() {
        when(repository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken token = service.crear(usuario);

        assertThat(token.getToken()).isNotBlank();
        assertThat(token.esValido(Instant.parse("2026-06-04T12:00:01Z"))).isTrue();
    }

    @Test
    void rejectsRevokedRefreshToken() {
        RefreshToken token = new RefreshToken(usuario, "revoked", Instant.parse("2026-06-05T12:00:00Z"));
        token.revocar();
        when(repository.findByToken("revoked")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.validar("revoked"))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Refresh token revocado");
    }
}

