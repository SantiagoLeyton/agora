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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "opcion")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Opcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pregunta_id", nullable = false)
    private Pregunta pregunta;

    @Column(nullable = false, length = 500)
    private String texto;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false)
    private Integer orden;

    @Column(nullable = false)
    private boolean activo = true;

    public Opcion(Pregunta pregunta, String texto, String descripcion, Integer orden) {
        this.pregunta = pregunta;
        this.texto = texto;
        this.descripcion = descripcion;
        this.orden = orden;
    }

    public void actualizar(String texto, String descripcion, Integer orden, boolean activo) {
        this.texto = texto;
        this.descripcion = descripcion;
        this.orden = orden;
        this.activo = activo;
    }
}
