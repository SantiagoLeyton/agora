package com.agora.modules.academic.domain;

import com.agora.modules.user.domain.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "grupo_estudiante")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GrupoEstudiante {

    @EmbeddedId
    private GrupoEstudianteId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("grupoId")
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("estudianteId")
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Usuario estudiante;

    @Column(name = "fecha_ingreso", nullable = false, updatable = false)
    private Instant fechaIngreso = Instant.now();

    public GrupoEstudiante(Grupo grupo, Usuario estudiante) {
        this.id = new GrupoEstudianteId(grupo.getId(), estudiante.getId());
        this.grupo = grupo;
        this.estudiante = estudiante;
    }
}
