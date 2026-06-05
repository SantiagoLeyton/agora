package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.Escena;

public record SceneResponse(Long id, Long casoId, Integer orden, String titulo, String descripcion, String contenido,
        boolean activo) {

    public static SceneResponse from(Escena escena) {
        return new SceneResponse(escena.getId(), escena.getCaso().getId(), escena.getOrden(), escena.getTitulo(),
                escena.getDescripcion(), escena.getContenido(), escena.isActivo());
    }
}
