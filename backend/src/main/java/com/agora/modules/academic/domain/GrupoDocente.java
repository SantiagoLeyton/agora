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
@Table(name = "grupo_docente")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GrupoDocente {

    @EmbeddedId
    private GrupoDocenteId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("grupoId")
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("docenteId")
    @JoinColumn(name = "docente_id", nullable = false)
    private Usuario docente;

    @Column(name = "fecha_asignacion", nullable = false, updatable = false)
    private Instant fechaAsignacion = Instant.now();

    public GrupoDocente(Grupo grupo, Usuario docente) {
        this.id = new GrupoDocenteId(grupo.getId(), docente.getId());
        this.grupo = grupo;
        this.docente = docente;
    }
}
