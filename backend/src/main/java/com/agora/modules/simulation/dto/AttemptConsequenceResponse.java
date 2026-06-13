package com.agora.modules.simulation.dto;

import java.time.Instant;
import java.util.List;

public record AttemptConsequenceResponse(
        Long respuestaId,
        Long preguntaId,
        String pregunta,
        Long opcionId,
        String opcion,
        String mensaje,
        String descripcion,
        String observacionPedagogica,
        List<ConsequenceImpactResponse> impactos,
        Instant fechaRespuesta) {
}
