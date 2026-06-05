package com.agora.modules.user.dto;

import com.agora.modules.user.domain.Usuario;
import java.time.Instant;

public record UserResponse(
        Long id,
        String nombre,
        String apellido,
        String correo,
        String rol,
        boolean activo,
        Instant ultimoAcceso,
        Instant fechaCreacion,
        Instant fechaActualizacion) {

    public static UserResponse from(Usuario usuario) {
        return new UserResponse(usuario.getId(), usuario.getNombre(), usuario.getApellido(), usuario.getCorreo(),
                usuario.getRol().getNombre(), usuario.isActivo(), usuario.getUltimoAcceso(),
                usuario.getFechaCreacion(), usuario.getFechaActualizacion());
    }
}
