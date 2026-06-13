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

    @Column(name = "clave_acceso", nullable = false, length = 32)
    private String claveAcceso;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();

    @Column(name = "fecha_actualizacion", nullable = false)
    private Instant fechaActualizacion = Instant.now();

    @OneToMany(mappedBy = "grupo")
    private Set<GrupoEstudiante> estudiantes = new HashSet<>();

    @OneToMany(mappedBy = "grupo")
    private Set<GrupoDocente> docentes = new HashSet<>();

    public Grupo(Usuario docente, String nombre, String descripcion, String periodo, String claveAcceso) {
        this.docente = docente;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.periodo = periodo;
        this.claveAcceso = claveAcceso;
    }

    public void actualizar(String nombre, String descripcion, String periodo, String claveAcceso) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.periodo = periodo;
        if (claveAcceso != null && !claveAcceso.isBlank()) {
            this.claveAcceso = claveAcceso;
        }
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

    public void cambiarDocente(Usuario docente) {
        this.docente = docente;
        fechaActualizacion = Instant.now();
    }
}
