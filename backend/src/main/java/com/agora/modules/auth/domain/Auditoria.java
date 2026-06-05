package com.agora.modules.auth.domain;

import com.agora.modules.user.domain.Usuario;
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
@Table(name = "auditoria")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 50)
    private String accion;

    @Column(nullable = false, length = 50)
    private String modulo;

    @Column(length = 500)
    private String descripcion;

    @Column(length = 45)
    private String ip;

    @Column(name = "fecha_evento", nullable = false, updatable = false)
    private Instant fechaEvento = Instant.now();

    public Auditoria(Usuario usuario, String accion, String modulo, String descripcion, String ip) {
        this.usuario = usuario;
        this.accion = accion;
        this.modulo = modulo;
        this.descripcion = descripcion;
        this.ip = ip;
    }
}

