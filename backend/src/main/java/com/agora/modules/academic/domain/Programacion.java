package com.agora.modules.academic.domain;

import com.agora.modules.user.domain.Usuario;
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
@Table(name = "programacion")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Programacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "docente_id", nullable = false)
    private Usuario docente;

    @Column(name = "caso_id")
    private Long casoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id")
    private Usuario estudiante;

    @Column(name = "fecha_inicio", nullable = false)
    private Instant fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private Instant fechaFin;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();

    public Programacion(Grupo grupo, Usuario docente, Long casoId, Usuario estudiante, Instant fechaInicio,
            Instant fechaFin) {
        this.grupo = grupo;
        this.docente = docente;
        this.casoId = casoId;
        this.estudiante = estudiante;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    public void actualizar(Grupo grupo, Long casoId, Usuario estudiante, Instant fechaInicio, Instant fechaFin,
            boolean activo) {
        this.grupo = grupo;
        this.casoId = casoId;
        this.estudiante = estudiante;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.activo = activo;
    }
}
