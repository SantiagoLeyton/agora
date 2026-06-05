package com.agora.modules.simulation.domain;

import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.user.domain.Usuario;
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
@Table(name = "intento")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Intento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Usuario estudiante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caso_id", nullable = false)
    private Caso caso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programacion_id")
    private Programacion programacion;

    @Column(name = "fecha_inicio", nullable = false, updatable = false)
    private Instant fechaInicio = Instant.now();

    @Column(name = "fecha_fin")
    private Instant fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SimulationStatus estado = SimulationStatus.EN_PROCESO;

    public Intento(Usuario estudiante, Caso caso, Programacion programacion) {
        this.estudiante = estudiante;
        this.caso = caso;
        this.programacion = programacion;
    }

    public void finalizar() {
        this.estado = SimulationStatus.FINALIZADO;
        this.fechaFin = Instant.now();
    }

    public void abandonar() {
        this.estado = SimulationStatus.ABANDONADO;
        this.fechaFin = Instant.now();
    }
}
