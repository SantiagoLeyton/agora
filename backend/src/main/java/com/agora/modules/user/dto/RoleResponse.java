package com.agora.modules.user.dto;

import com.agora.modules.user.domain.Rol;

public record RoleResponse(
        Long id,
        String nombre,
        String descripcion,
        boolean activo) {

    public static RoleResponse from(Rol rol) {
        return new RoleResponse(rol.getId(), rol.getNombre(), rol.getDescripcion(), rol.isActivo());
    }
}
