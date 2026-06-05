package com.agora.modules.academic.domain;

import com.agora.modules.user.domain.Usuario;
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
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "grupo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "docente_id", nullable = false)
    private Usuario docente;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String periodo;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();

    @Column(name = "fecha_actualizacion", nullable = false)
    private Instant fechaActualizacion = Instant.now();

    @OneToMany(mappedBy = "grupo")
    private Set<GrupoEstudiante> estudiantes = new HashSet<>();

    public Grupo(Usuario docente, String nombre, String descripcion, String periodo) {
        this.docente = docente;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.periodo = periodo;
    }

    public void actualizar(String nombre, String descripcion, String periodo) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.periodo = periodo;
        fechaActualizacion = Instant.now();
    }

    public void activar() {
        activo = true;
        fechaActualizacion = Instant.now();
    }

    public void desactivar() {
        activo = false;
        fechaActualizacion = Instant.now();
    }
}
