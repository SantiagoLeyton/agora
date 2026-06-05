package com.agora.modules.auth.repository;

import com.agora.modules.auth.domain.RefreshToken;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByTokenAndRevocadoFalseAndFechaExpiracionAfter(String token, Instant ahora);

    @Modifying
    @Query("update RefreshToken token set token.revocado = true where token.usuario.id = :usuarioId and token.revocado = false")
    int revokeActiveByUsuarioId(Long usuarioId);
}
