package com.agora.modules.simulation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "retroalimentacion")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Retroalimentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intento_id", nullable = false)
    private Intento intento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FeedbackAuthor autor;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "tiempo_total")
    private Long tiempoTotal;

    @Column(name = "escenas_completadas")
    private Integer escenasCompletadas;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_generacion", nullable = false, updatable = false)
    private Instant fechaGeneracion = Instant.now();

    public Retroalimentacion(Intento intento, FeedbackAuthor autor, String contenido, Long tiempoTotal,
            Integer escenasCompletadas, String observaciones) {
        this.intento = intento;
        this.autor = autor;
        this.contenido = contenido;
        this.tiempoTotal = tiempoTotal;
        this.escenasCompletadas = escenasCompletadas;
        this.observaciones = observaciones;
    }
}
