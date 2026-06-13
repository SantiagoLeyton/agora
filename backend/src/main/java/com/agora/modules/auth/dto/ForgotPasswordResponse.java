package com.agora.modules.auth.dto;

public record ForgotPasswordResponse(
        String mensaje,
        String tokenDesarrollo,
        String enlaceDesarrollo) {
}
