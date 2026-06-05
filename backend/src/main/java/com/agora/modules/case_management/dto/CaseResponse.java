package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.Caso;
import java.time.Instant;

public record CaseResponse(Long id, String titulo, String descripcion, String objetivo, String nivelDificultad,
        Integer duracionEstimada, boolean activo, Instant fechaCreacion, Instant fechaActualizacion) {

    public static CaseResponse from(Caso caso) {
        return new CaseResponse(caso.getId(), caso.getTitulo(), caso.getDescripcion(), caso.getObjetivo(),
                caso.getNivelDificultad(), caso.getDuracionEstimada(), caso.isActivo(), caso.getFechaCreacion(),
                caso.getFechaActualizacion());
    }
}
