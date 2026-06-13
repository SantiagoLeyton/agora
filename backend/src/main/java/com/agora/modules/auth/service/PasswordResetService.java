package com.agora.modules.auth.service;

import com.agora.infrastructure.security.RefreshTokenRevocationService;
import com.agora.modules.auth.domain.PasswordResetToken;
import com.agora.modules.auth.dto.ForgotPasswordResponse;
import com.agora.modules.auth.dto.ResetPasswordRequest;
import com.agora.modules.auth.repository.PasswordResetTokenRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRevocationService refreshTokenRevocationService;
    private final AuditoriaService auditoriaService;

    @Value("${agora.password-reset.frontend-url:http://localhost:3000/reset-password}")
    private String frontendResetUrl;

    @Value("${agora.password-reset.expose-dev-token:true}")
    private boolean exposeDevToken;

    @Transactional
    public ForgotPasswordResponse solicitar(String correo, String ip) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo).orElse(null);
        if (usuario == null || !usuario.isActivo()) {
            return new ForgotPasswordResponse(
                    "Si el correo existe en el sistema, recibirás instrucciones para restablecer tu contraseña.",
                    null,
                    null);
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken resetToken = tokenRepository.save(
                new PasswordResetToken(usuario, token, Instant.now().plus(1, ChronoUnit.HOURS)));
        auditoriaService.registrar(usuario, "PASSWORD_RESET_REQUESTED", "Solicitud de recuperación de contraseña", ip);

        String devLink = frontendResetUrl + "?token=" + resetToken.getToken();
        return new ForgotPasswordResponse(
                "Si el correo existe en el sistema, recibirás instrucciones para restablecer tu contraseña.",
                exposeDevToken ? resetToken.getToken() : null,
                exposeDevToken ? devLink : null);
    }

    @Transactional
    public void restablecer(ResetPasswordRequest request, String ip) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new ResourceNotFoundException("Token de recuperación inválido o expirado"));

        if (!resetToken.isVigente(Instant.now())) {
            throw new BusinessRuleException("Token de recuperación inválido o expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        if (!usuario.isActivo()) {
            throw new BusinessRuleException("La cuenta está inactiva");
        }

        usuario.cambiarPassword(passwordEncoder.encode(request.password()));
        usuarioRepository.save(usuario);
        resetToken.marcarUsado();
        tokenRepository.save(resetToken);
        refreshTokenRevocationService.revocarActivosPorUsuario(usuario.getId());
        auditoriaService.registrar(usuario, "PASSWORD_RESET_COMPLETED", "Contraseña restablecida", ip);
    }
}
