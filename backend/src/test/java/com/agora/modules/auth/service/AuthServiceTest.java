package com.agora.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agora.modules.auth.dto.LoginRequest;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.JwtProperties;
import com.agora.security.JwtService;
import com.agora.shared.exception.InvalidCredentialsException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock AuthenticationManager authenticationManager;
    @Mock UsuarioRepository usuarioRepository;
    @Mock JwtService jwtService;
    @Mock RefreshTokenService refreshTokenService;
    @Mock AuditoriaService auditoriaService;

    @Test
    void auditsAndRejectsInvalidCredentials() {
        AuthService service = new AuthService(authenticationManager, usuarioRepository, jwtService,
                new JwtProperties("secret", 900, 604800), refreshTokenService, auditoriaService);
        LoginRequest request = new LoginRequest("nobody@agora.com", "wrong");
        when(usuarioRepository.findByCorreoIgnoreCase(request.correo())).thenReturn(Optional.empty());
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> service.login(request, "127.0.0.1"))
                .isInstanceOf(InvalidCredentialsException.class);
        verify(auditoriaService).registrar(eq(null), eq("LOGIN_FALLIDO"), eq("Credenciales invalidas"),
                eq("127.0.0.1"));
    }
}

