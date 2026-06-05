package com.agora.modules.auth.dto;

import com.agora.modules.user.domain.Usuario;
import com.agora.security.UserPrincipal;

public record AuthenticatedUserResponse(
        Long id,
        String nombre,
        String apellido,
        String correo,
        String rol) {

    public static AuthenticatedUserResponse from(Usuario usuario) {
        return new AuthenticatedUserResponse(usuario.getId(), usuario.getNombre(), usuario.getApellido(),
                usuario.getCorreo(), usuario.getRol().getNombre());
    }

    public static AuthenticatedUserResponse from(UserPrincipal principal) {
        return new AuthenticatedUserResponse(principal.id(), principal.nombre(), principal.apellido(),
                principal.correo(), principal.rol());
    }
}

