package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.ResultadoAprendizaje;
import java.time.Instant;

public record LearningOutcomeResponse(Long id, Long casoId, Integer orden, String descripcion, Instant fechaCreacion,
        Instant fechaActualizacion) {

    public static LearningOutcomeResponse from(ResultadoAprendizaje resultado) {
        return new LearningOutcomeResponse(resultado.getId(), resultado.getCaso().getId(), resultado.getOrden(),
                resultado.getDescripcion(), resultado.getFechaCreacion(), resultado.getFechaActualizacion());
    }
}
