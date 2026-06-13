package com.agora.modules.auth.controller;

import com.agora.modules.auth.dto.AuthenticatedUserResponse;
import com.agora.modules.auth.dto.LoginRequest;
import com.agora.modules.auth.dto.LoginResponse;
import com.agora.modules.auth.dto.ForgotPasswordRequest;
import com.agora.modules.auth.dto.ForgotPasswordResponse;
import com.agora.modules.auth.dto.LogoutRequest;
import com.agora.modules.auth.dto.RefreshTokenRequest;
import com.agora.modules.auth.dto.RefreshTokenResponse;
import com.agora.modules.auth.dto.ResetPasswordRequest;
import com.agora.modules.auth.service.AuthService;
import com.agora.modules.auth.service.PasswordResetService;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate with email and password")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        return authService.login(request, clientIp(servletRequest));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate a refresh token and obtain a new access token")
    public RefreshTokenResponse refresh(
            @Valid @RequestBody RefreshTokenRequest request, HttpServletRequest servletRequest) {
        return authService.refresh(request.refreshToken(), clientIp(servletRequest));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Revoke a refresh token")
    public void logout(@Valid @RequestBody LogoutRequest request, HttpServletRequest servletRequest) {
        authService.logout(request.refreshToken(), clientIp(servletRequest));
    }

    @GetMapping("/me")
    @Operation(summary = "Return the authenticated user")
    public AuthenticatedUserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.me(principal);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset link")
    public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {
        return passwordResetService.solicitar(request.correo(), clientIp(servletRequest));
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reset password using a valid token")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest servletRequest) {
        passwordResetService.restablecer(request, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr()
                : forwarded.split(",")[0].trim();
    }
}

