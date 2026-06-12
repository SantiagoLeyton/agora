package com.agora.modules.simulation.dto;

import com.agora.modules.simulation.domain.Intento;
import java.math.BigDecimal;
import java.time.Instant;

public record AttemptResponse(
        Long id,
        Long estudianteId,
        Long casoId,
        Long programacionId,
        Instant fechaInicio,
        Instant fechaFin,
        String estado,
        BigDecimal puntosObtenidos,
        BigDecimal puntosMaximos,
        BigDecimal notaFinal) {

    public static AttemptResponse from(Intento intento) {
        Long programacionId = intento.getProgramacion() == null ? null : intento.getProgramacion().getId();
        return new AttemptResponse(intento.getId(), intento.getEstudiante().getId(), intento.getCaso().getId(),
                programacionId, intento.getFechaInicio(), intento.getFechaFin(), intento.getEstado().name(),
                intento.getPuntosObtenidos(), intento.getPuntosMaximos(), intento.getNotaFinal());
    }
}
