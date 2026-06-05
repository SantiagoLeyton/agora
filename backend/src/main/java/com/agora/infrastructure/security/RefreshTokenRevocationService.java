package com.agora.infrastructure.security;

import com.agora.modules.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenRevocationService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public int revocarActivosPorUsuario(Long usuarioId) {
        return refreshTokenRepository.revokeActiveByUsuarioId(usuarioId);
    }
}
