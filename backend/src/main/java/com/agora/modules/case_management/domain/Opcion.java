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
import java.math.BigDecimal;
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

    @Column(name = "porcentaje_credito", precision = 5, scale = 2)
    private BigDecimal porcentajeCredito;

    public Opcion(Pregunta pregunta, String texto, String descripcion, Integer orden) {
        this(pregunta, texto, descripcion, orden, null);
    }

    public Opcion(Pregunta pregunta, String texto, String descripcion, Integer orden, BigDecimal porcentajeCredito) {
        this.pregunta = pregunta;
        this.texto = texto;
        this.descripcion = descripcion;
        this.orden = orden;
        this.porcentajeCredito = porcentajeCredito;
    }

    public void actualizar(String texto, String descripcion, Integer orden, boolean activo, BigDecimal porcentajeCredito) {
        this.texto = texto;
        this.descripcion = descripcion;
        this.orden = orden;
        this.activo = activo;
        this.porcentajeCredito = porcentajeCredito;
    }
}
