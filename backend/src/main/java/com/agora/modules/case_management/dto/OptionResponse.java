package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.Opcion;

public record OptionResponse(Long id, Long preguntaId, String texto, String descripcion, Integer orden, boolean activo) {

    public static OptionResponse from(Opcion opcion) {
        return new OptionResponse(opcion.getId(), opcion.getPregunta().getId(), opcion.getTexto(),
                opcion.getDescripcion(), opcion.getOrden(), opcion.isActivo());
    }
}
