package com.agora.modules.academic.dto;

import com.agora.modules.academic.domain.Grupo;
import java.time.Instant;
import java.util.List;

public record GroupResponse(
        Long id,
        Long docenteId,
        String docenteCorreo,
        List<Long> docenteIds,
        int docentesAsignados,
        int cupoDocentesDisponible,
        String nombre,
        String descripcion,
        String periodo,
        String claveAcceso,
        boolean activo,
        boolean inscrito,
        Instant fechaCreacion,
        Instant fechaActualizacion) {

    public static GroupResponse from(Grupo grupo) {
        return from(grupo, List.of(grupo.getDocente().getId()), null, false);
    }

    public static GroupResponse from(Grupo grupo, List<Long> docenteIds, String claveAcceso, boolean inscrito) {
        int assigned = docenteIds == null ? 1 : docenteIds.size();
        return new GroupResponse(
                grupo.getId(),
                grupo.getDocente().getId(),
                grupo.getDocente().getCorreo(),
                docenteIds,
                assigned,
                Math.max(0, 2 - assigned),
                grupo.getNombre(),
                grupo.getDescripcion(),
                grupo.getPeriodo(),
                claveAcceso,
                grupo.isActivo(),
                inscrito,
                grupo.getFechaCreacion(),
                grupo.getFechaActualizacion());
    }
}
