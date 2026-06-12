package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.user.domain.Usuario;
import java.time.Instant;
import java.util.List;

public record CaseResponse(Long id, String titulo, String descripcion, String objetivo, String nivelDificultad,
        Integer duracionEstimada, boolean activo, Instant fechaCreacion, Instant fechaActualizacion, Long creadorId,
        String creadorNombre, List<LearningOutcomeResponse> resultadosAprendizaje) {

    public static CaseResponse from(Caso caso) {
        return from(caso, List.of());
    }

    public static CaseResponse from(Caso caso, List<LearningOutcomeResponse> resultadosAprendizaje) {
        Usuario creador = caso.getCreador();
        String creadorNombre = creador == null ? null
                : ("%s %s".formatted(creador.getNombre(), creador.getApellido())).trim();
        Long creadorId = creador == null ? null : creador.getId();
        return new CaseResponse(caso.getId(), caso.getTitulo(), caso.getDescripcion(), caso.getObjetivo(),
                caso.getNivelDificultad(), caso.getDuracionEstimada(), caso.isActivo(), caso.getFechaCreacion(),
                caso.getFechaActualizacion(), creadorId, creadorNombre, resultadosAprendizaje);
    }
}
