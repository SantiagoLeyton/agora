package com.agora.modules.case_management.domain;

import com.agora.modules.user.domain.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "caso")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Caso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Column(length = 1000)
    private String objetivo;

    @Column(name = "nivel_dificultad", nullable = false, length = 50)
    private String nivelDificultad;

    @Column(name = "duracion_estimada", nullable = false)
    private Integer duracionEstimada;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();

    @Column(name = "fecha_actualizacion", nullable = false)
    private Instant fechaActualizacion = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creador_id")
    private Usuario creador;

    @OneToMany(mappedBy = "caso")
    @OrderBy("orden ASC")
    private Set<Escena> escenas = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "caso_herramienta",
            joinColumns = @JoinColumn(name = "caso_id"),
            inverseJoinColumns = @JoinColumn(name = "herramienta_id"))
    private Set<Herramienta> herramientas = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "caso_entidad",
            joinColumns = @JoinColumn(name = "caso_id"),
            inverseJoinColumns = @JoinColumn(name = "entidad_id"))
    private Set<EntidadInstitucional> entidades = new HashSet<>();

    public Caso(String titulo, String descripcion, String objetivo, String nivelDificultad, Integer duracionEstimada,
            Usuario creador) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.objetivo = objetivo;
        this.nivelDificultad = nivelDificultad;
        this.duracionEstimada = duracionEstimada;
        this.creador = creador;
    }

    public void actualizar(String titulo, String descripcion, String objetivo, String nivelDificultad,
            Integer duracionEstimada) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.objetivo = objetivo;
        this.nivelDificultad = nivelDificultad;
        this.duracionEstimada = duracionEstimada;
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

    public void asociar(Herramienta herramienta) {
        herramientas.add(herramienta);
    }

    public void asociar(EntidadInstitucional entidad) {
        entidades.add(entidad);
    }

    public void desasociar(Herramienta herramienta) {
        herramientas.remove(herramienta);
        fechaActualizacion = Instant.now();
    }

    public void desasociar(EntidadInstitucional entidad) {
        entidades.remove(entidad);
        fechaActualizacion = Instant.now();
    }
}
