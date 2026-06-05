package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.EntidadInstitucional;

public record InstitutionalEntityResponse(Long id, String nombre, String tipo, String descripcion, boolean activo) {

    public static InstitutionalEntityResponse from(EntidadInstitucional entidad) {
        return new InstitutionalEntityResponse(entidad.getId(), entidad.getNombre(), entidad.getTipo(),
                entidad.getDescripcion(), entidad.isActivo());
    }
}
