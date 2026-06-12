package com.agora.modules.case_management.domain;

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
@Table(name = "resultado_aprendizaje")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResultadoAprendizaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caso_id", nullable = false)
    private Caso caso;

    @Column(nullable = false)
    private Integer orden;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();

    @Column(name = "fecha_actualizacion", nullable = false)
    private Instant fechaActualizacion = Instant.now();

    public ResultadoAprendizaje(Caso caso, Integer orden, String descripcion) {
        this.caso = caso;
        this.orden = orden;
        this.descripcion = descripcion;
    }

    public void actualizar(Integer orden, String descripcion) {
        this.orden = orden;
        this.descripcion = descripcion;
        fechaActualizacion = Instant.now();
    }
}
