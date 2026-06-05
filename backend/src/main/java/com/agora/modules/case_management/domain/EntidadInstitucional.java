package com.agora.modules.case_management.domain;

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
@Table(name = "entidad_institucional")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EntidadInstitucional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String tipo;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false)
    private boolean activo = true;

    public EntidadInstitucional(String nombre, String tipo, String descripcion) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcion = descripcion;
    }

    public void actualizar(String nombre, String tipo, String descripcion, boolean activo) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.activo = activo;
    }
}
