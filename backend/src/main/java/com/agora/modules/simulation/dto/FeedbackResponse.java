package com.agora.modules.simulation.dto;

import com.agora.modules.simulation.domain.Retroalimentacion;
import java.time.Instant;

public record FeedbackResponse(
        Long id,
        Long intentoId,
        String autor,
        String contenido,
        Long tiempoTotal,
        Integer escenasCompletadas,
        String observaciones,
        Instant fechaGeneracion) {

    public static FeedbackResponse from(Retroalimentacion retroalimentacion) {
        return new FeedbackResponse(retroalimentacion.getId(), retroalimentacion.getIntento().getId(),
                retroalimentacion.getAutor().name(), retroalimentacion.getContenido(),
                retroalimentacion.getTiempoTotal(), retroalimentacion.getEscenasCompletadas(),
                retroalimentacion.getObservaciones(), retroalimentacion.getFechaGeneracion());
    }
}
