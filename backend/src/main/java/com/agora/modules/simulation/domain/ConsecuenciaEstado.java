package com.agora.modules.simulation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "consecuencia_estado")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConsecuenciaEstado {

    @EmbeddedId
    private ConsecuenciaEstadoId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("consecuenciaId")
    @JoinColumn(name = "consecuencia_id", nullable = false)
    private Consecuencia consecuencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("estadoEmocionalId")
    @JoinColumn(name = "estado_emocional_id", nullable = false)
    private EstadoEmocional estadoEmocional;

    @Column(nullable = false)
    private Integer variacion;

    public ConsecuenciaEstado(Consecuencia consecuencia, EstadoEmocional estadoEmocional, Integer variacion) {
        this.consecuencia = consecuencia;
        this.estadoEmocional = estadoEmocional;
        this.variacion = variacion;
        this.id = new ConsecuenciaEstadoId(consecuencia.getId(), estadoEmocional.getId());
    }
}
