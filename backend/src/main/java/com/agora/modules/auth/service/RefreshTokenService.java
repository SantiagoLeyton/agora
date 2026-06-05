package com.agora.modules.auth.service;

import com.agora.modules.auth.domain.RefreshToken;
import com.agora.modules.auth.repository.RefreshTokenRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.JwtProperties;
import com.agora.shared.exception.InvalidRefreshTokenException;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final JwtProperties properties;
    private final Clock clock;

    @Autowired
    public RefreshTokenService(RefreshTokenRepository repository, JwtProperties properties) {
        this(repository, properties, Clock.systemUTC());
    }

    RefreshTokenService(RefreshTokenRepository repository, JwtProperties properties, Clock clock) {
        this.repository = repository;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public RefreshToken crear(Usuario usuario) {
        String value = UUID.randomUUID() + "." + UUID.randomUUID();
        return repository.save(new RefreshToken(usuario, value,
                clock.instant().plusSeconds(properties.refreshTokenExpirationSeconds())));
    }

    @Transactional(readOnly = true)
    public RefreshToken validar(String token) {
        RefreshToken refreshToken = repository.findByToken(token)
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token invalido"));
        if (refreshToken.isRevocado()) {
            throw new InvalidRefreshTokenException("Refresh token revocado");
        }
        if (!refreshToken.getFechaExpiracion().isAfter(clock.instant())) {
            throw new InvalidRefreshTokenException("Refresh token expirado");
        }
        return refreshToken;
    }

    @Transactional
    public RefreshToken rotar(RefreshToken actual) {
        actual.revocar();
        repository.save(actual);
        return crear(actual.getUsuario());
    }

    @Transactional
    public RefreshToken revocar(String token) {
        RefreshToken refreshToken = validar(token);
        refreshToken.revocar();
        return repository.save(refreshToken);
    }
}
