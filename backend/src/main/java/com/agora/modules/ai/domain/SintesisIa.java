package com.agora.modules.ai.domain;

import com.agora.modules.simulation.domain.Intento;
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
@Table(name = "sintesis_ia")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SintesisIa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intento_id", nullable = false)
    private Intento intento;

    @Column(name = "prompt_utilizado", nullable = false, columnDefinition = "TEXT")
    private String promptUtilizado;

    @Column(name = "respuesta_generada", nullable = false, columnDefinition = "TEXT")
    private String respuestaGenerada;

    @Column(name = "modelo_utilizado", nullable = false, length = 100)
    private String modeloUtilizado;

    @Column(name = "fue_exitosa", nullable = false)
    private boolean fueExitosa;

    @Column(name = "mensaje_error", columnDefinition = "TEXT")
    private String mensajeError;

    @Column(name = "fecha_generacion", nullable = false, updatable = false)
    private Instant fechaGeneracion = Instant.now();

    public SintesisIa(Intento intento, String promptUtilizado, String respuestaGenerada, String modeloUtilizado,
            boolean fueExitosa, String mensajeError) {
        this.intento = intento;
        this.promptUtilizado = promptUtilizado;
        this.respuestaGenerada = respuestaGenerada;
        this.modeloUtilizado = modeloUtilizado;
        this.fueExitosa = fueExitosa;
        this.mensajeError = mensajeError;
    }
}
