package com.agora.modules.simulation.dto;

import java.util.List;

public record ConsequenceDetailResponse(
        Long id,
        String mensaje,
        String descripcion,
        String observacionPedagogica,
        List<ConsequenceImpactResponse> impactos) {
}
