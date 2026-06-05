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
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "escena")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Escena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caso_id", nullable = false)
    private Caso caso;

    @Column(nullable = false)
    private Integer orden;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(nullable = false)
    private boolean activo = true;

    @OneToMany(mappedBy = "escena")
    private Set<Pregunta> preguntas = new HashSet<>();

    public Escena(Caso caso, Integer orden, String titulo, String descripcion, String contenido) {
        this.caso = caso;
        this.orden = orden;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.contenido = contenido;
    }

    public void actualizar(Integer orden, String titulo, String descripcion, String contenido, boolean activo) {
        this.orden = orden;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.contenido = contenido;
        this.activo = activo;
    }
}
