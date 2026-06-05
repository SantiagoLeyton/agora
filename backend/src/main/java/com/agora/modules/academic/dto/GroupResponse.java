package com.agora.modules.academic.dto;

import com.agora.modules.academic.domain.Grupo;
import java.time.Instant;

public record GroupResponse(
        Long id,
        Long docenteId,
        String docenteCorreo,
        String nombre,
        String descripcion,
        String periodo,
        boolean activo,
        Instant fechaCreacion,
        Instant fechaActualizacion) {

    public static GroupResponse from(Grupo grupo) {
        return new GroupResponse(grupo.getId(), grupo.getDocente().getId(), grupo.getDocente().getCorreo(),
                grupo.getNombre(), grupo.getDescripcion(), grupo.getPeriodo(), grupo.isActivo(),
                grupo.getFechaCreacion(), grupo.getFechaActualizacion());
    }
}
