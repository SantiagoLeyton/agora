package com.agora.modules.ai.dto;

import com.agora.modules.ai.domain.SintesisIa;
import java.time.Instant;

public record AISummaryResponse(
        Long id,
        Long intentoId,
        String promptUtilizado,
        String respuestaGenerada,
        String modeloUtilizado,
        boolean fueExitosa,
        String mensajeError,
        Instant fechaGeneracion) {

    public static AISummaryResponse from(SintesisIa sintesis) {
        return new AISummaryResponse(sintesis.getId(), sintesis.getIntento().getId(),
                sintesis.getPromptUtilizado(), sintesis.getRespuestaGenerada(), sintesis.getModeloUtilizado(),
                sintesis.isFueExitosa(), sintesis.getMensajeError(), sintesis.getFechaGeneracion());
    }
}
