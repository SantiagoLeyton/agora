package com.agora.modules.simulation.dto;

import com.agora.modules.simulation.domain.Bitacora;
import java.time.Instant;

public record JournalResponse(
        Long id,
        Long intentoId,
        String titulo,
        String contenido,
        Instant fechaRegistro) {

    public static JournalResponse from(Bitacora bitacora) {
        return new JournalResponse(bitacora.getId(), bitacora.getIntento().getId(), bitacora.getTitulo(),
                bitacora.getContenido(), bitacora.getFechaRegistro());
    }
}
