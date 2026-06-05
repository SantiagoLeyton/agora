package com.agora.modules.auth.service;

import com.agora.modules.auth.domain.RefreshToken;
import com.agora.modules.auth.dto.AuthenticatedUserResponse;
import com.agora.modules.auth.dto.LoginRequest;
import com.agora.modules.auth.dto.LoginResponse;
import com.agora.modules.auth.dto.RefreshTokenResponse;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.JwtProperties;
import com.agora.security.JwtService;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.InactiveUserException;
import com.agora.shared.exception.InvalidCredentialsException;
import com.agora.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final RefreshTokenService refreshTokenService;
    private final AuditoriaService auditoriaService;

    @Transactional
    public LoginResponse login(LoginRequest request, String ip) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(request.correo()).orElse(null);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.correo(), request.password()));
        } catch (DisabledException exception) {
            auditoriaService.registrar(usuario, "LOGIN_FALLIDO", "Usuario inactivo", ip);
            throw new InactiveUserException();
        } catch (AuthenticationException exception) {
            auditoriaService.registrar(usuario, "LOGIN_FALLIDO", "Credenciales invalidas", ip);
            throw new InvalidCredentialsException();
        }

        if (usuario == null) {
            throw new InvalidCredentialsException();
        }
        if (!usuario.isActivo()) {
            throw new InactiveUserException();
        }

        usuario.registrarAcceso();
        usuarioRepository.save(usuario);
        UserPrincipal principal = UserPrincipal.from(usuario);
        RefreshToken refreshToken = refreshTokenService.crear(usuario);
        auditoriaService.registrar(usuario, "LOGIN_EXITOSO", "Inicio de sesion exitoso", ip);
        return new LoginResponse(jwtService.generateAccessToken(principal), refreshToken.getToken(), "Bearer",
                jwtProperties.accessTokenExpirationSeconds(), AuthenticatedUserResponse.from(usuario));
    }

    @Transactional
    public RefreshTokenResponse refresh(String token, String ip) {
        RefreshToken actual = refreshTokenService.validar(token);
        Usuario usuario = actual.getUsuario();
        if (!usuario.isActivo()) {
            throw new InactiveUserException();
        }
        RefreshToken nuevo = refreshTokenService.rotar(actual);
        auditoriaService.registrar(usuario, "REFRESH_TOKEN_USADO", "Refresh token rotado", ip);
        return new RefreshTokenResponse(jwtService.generateAccessToken(UserPrincipal.from(usuario)), nuevo.getToken(),
                "Bearer", jwtProperties.accessTokenExpirationSeconds());
    }

    @Transactional
    public void logout(String token, String ip) {
        RefreshToken refreshToken = refreshTokenService.revocar(token);
        auditoriaService.registrar(refreshToken.getUsuario(), "LOGOUT", "Cierre de sesion exitoso", ip);
    }

    @Transactional(readOnly = true)
    public AuthenticatedUserResponse me(UserPrincipal principal) {
        Usuario usuario = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return AuthenticatedUserResponse.from(usuario);
    }
}

