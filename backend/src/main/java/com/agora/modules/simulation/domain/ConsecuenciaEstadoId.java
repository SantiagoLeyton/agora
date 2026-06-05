package com.agora.modules.simulation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ConsecuenciaEstadoId implements Serializable {

    @Column(name = "consecuencia_id")
    private Long consecuenciaId;

    @Column(name = "estado_emocional_id")
    private Long estadoEmocionalId;
}
