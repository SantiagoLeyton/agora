package com.agora.modules.simulation.domain;

import com.agora.modules.case_management.domain.Opcion;
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
@Table(name = "consecuencia")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Consecuencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "opcion_id", nullable = false)
    private Opcion opcion;

    @Column(length = 1000)
    private String descripcion;

    @Column(length = 1000)
    private String mensaje;

    public Consecuencia(Opcion opcion, String descripcion, String mensaje) {
        this.opcion = opcion;
        this.descripcion = descripcion;
        this.mensaje = mensaje;
    }
}
