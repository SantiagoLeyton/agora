package com.agora.modules.academic.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class GrupoEstudianteId implements Serializable {

    @Column(name = "grupo_id")
    private Long grupoId;

    @Column(name = "estudiante_id")
    private Long estudianteId;
}
