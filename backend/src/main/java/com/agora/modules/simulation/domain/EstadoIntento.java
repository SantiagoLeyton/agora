package com.agora.modules.simulation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "estado_intento")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EstadoIntento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intento_id", nullable = false)
    private Intento intento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estado_emocional_id", nullable = false)
    private EstadoEmocional estadoEmocional;

    @Column(name = "valor_actual", nullable = false)
    private Integer valorActual;

    @Column(name = "ultima_actualizacion", nullable = false)
    private Instant ultimaActualizacion = Instant.now();

    public EstadoIntento(Intento intento, EstadoEmocional estadoEmocional, Integer valorActual) {
        this.intento = intento;
        this.estadoEmocional = estadoEmocional;
        this.valorActual = valorActual;
    }

    public void aplicarVariacion(Integer variacion) {
        int nuevoValor = valorActual + variacion;
        valorActual = Math.max(estadoEmocional.getValorMinimo(), Math.min(estadoEmocional.getValorMaximo(), nuevoValor));
        ultimaActualizacion = Instant.now();
    }
}
