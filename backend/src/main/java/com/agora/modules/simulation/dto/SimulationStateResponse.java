package com.agora.modules.simulation.dto;

import com.agora.modules.simulation.domain.EstadoIntento;
import java.time.Instant;

public record SimulationStateResponse(
        Long id,
        Long estadoEmocionalId,
        String nombre,
        String descripcion,
        Integer valorMinimo,
        Integer valorMaximo,
        Integer valorActual,
        Instant ultimaActualizacion) {

    public static SimulationStateResponse from(EstadoIntento estado) {
        return new SimulationStateResponse(estado.getId(), estado.getEstadoEmocional().getId(),
                estado.getEstadoEmocional().getNombre(), estado.getEstadoEmocional().getDescripcion(),
                estado.getEstadoEmocional().getValorMinimo(), estado.getEstadoEmocional().getValorMaximo(),
                estado.getValorActual(), estado.getUltimaActualizacion());
    }
}
