package com.agora.modules.simulation.dto;

public record ConsequenceImpactResponse(
        String estado,
        Integer variacion,
        Integer valorAnterior,
        Integer valorActual) {
}
