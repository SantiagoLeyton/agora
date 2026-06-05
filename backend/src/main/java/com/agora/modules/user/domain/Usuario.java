package com.agora.modules.user.domain;

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
@Table(name = "usuario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 255)
    private String correo;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "ultimo_acceso")
    private Instant ultimoAcceso;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion = Instant.now();

    @Column(name = "fecha_actualizacion", nullable = false)
    private Instant fechaActualizacion = Instant.now();

    public Usuario(Rol rol, String nombre, String apellido, String correo, String passwordHash) {
        this.rol = rol;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo.toLowerCase();
        this.passwordHash = passwordHash;
    }

    public void registrarAcceso() {
        ultimoAcceso = Instant.now();
        fechaActualizacion = ultimoAcceso;
    }

    public void actualizar(String nombre, String apellido, String correo, Rol rol, boolean activo) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo.toLowerCase();
        this.rol = rol;
        this.activo = activo;
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

    public void cambiarPassword(String passwordHash) {
        this.passwordHash = passwordHash;
        fechaActualizacion = Instant.now();
    }
}
