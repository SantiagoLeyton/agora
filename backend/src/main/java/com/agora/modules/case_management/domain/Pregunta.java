package com.agora.modules.case_management.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pregunta")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "escena_id", nullable = false)
    private Escena escena;

    @Column(nullable = false, length = 1000)
    private String enunciado;

    @Column(nullable = false)
    private boolean obligatoria = true;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "peso_puntos", precision = 10, scale = 2)
    private BigDecimal pesoPuntos;

    @OneToMany(mappedBy = "pregunta")
    private Set<Opcion> opciones = new HashSet<>();

    public Pregunta(Escena escena, String enunciado, boolean obligatoria) {
        this(escena, enunciado, obligatoria, null);
    }

    public Pregunta(Escena escena, String enunciado, boolean obligatoria, BigDecimal pesoPuntos) {
        this.escena = escena;
        this.enunciado = enunciado;
        this.obligatoria = obligatoria;
        this.pesoPuntos = pesoPuntos;
    }

    public void actualizar(String enunciado, boolean obligatoria, boolean activo, BigDecimal pesoPuntos) {
        this.enunciado = enunciado;
        this.obligatoria = obligatoria;
        this.activo = activo;
        this.pesoPuntos = pesoPuntos;
    }
}
