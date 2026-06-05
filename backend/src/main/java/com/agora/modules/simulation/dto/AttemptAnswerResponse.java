package com.agora.modules.simulation.dto;

import com.agora.modules.simulation.domain.Respuesta;
import java.time.Instant;

public record AttemptAnswerResponse(
        Long id,
        Long preguntaId,
        String pregunta,
        Long opcionId,
        String opcion,
        Instant fechaRespuesta) {

    public static AttemptAnswerResponse from(Respuesta respuesta) {
        return new AttemptAnswerResponse(respuesta.getId(), respuesta.getPregunta().getId(),
                respuesta.getPregunta().getEnunciado(), respuesta.getOpcion().getId(), respuesta.getOpcion().getTexto(),
                respuesta.getFechaRespuesta());
    }
}
