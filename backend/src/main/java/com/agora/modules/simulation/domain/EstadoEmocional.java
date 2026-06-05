package com.agora.modules.simulation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "estado_emocional")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EstadoEmocional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    @Column(name = "valor_minimo", nullable = false)
    private Integer valorMinimo;

    @Column(name = "valor_maximo", nullable = false)
    private Integer valorMaximo;

    @Column(name = "valor_inicial", nullable = false)
    private Integer valorInicial;

    public EstadoEmocional(String nombre, String descripcion, Integer valorMinimo, Integer valorMaximo,
            Integer valorInicial) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.valorMinimo = valorMinimo;
        this.valorMaximo = valorMaximo;
        this.valorInicial = valorInicial;
    }
}
