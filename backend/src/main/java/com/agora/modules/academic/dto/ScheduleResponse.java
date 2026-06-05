package com.agora.modules.academic.dto;

import com.agora.modules.academic.domain.Programacion;
import java.time.Instant;

public record ScheduleResponse(
        Long id,
        Long grupoId,
        String grupoNombre,
        Long docenteId,
        String docenteCorreo,
        Long casoId,
        Instant fechaInicio,
        Instant fechaFin,
        boolean activo,
        Instant fechaCreacion) {

    public static ScheduleResponse from(Programacion programacion) {
        return new ScheduleResponse(programacion.getId(), programacion.getGrupo().getId(),
                programacion.getGrupo().getNombre(), programacion.getDocente().getId(),
                programacion.getDocente().getCorreo(), programacion.getCasoId(), programacion.getFechaInicio(),
                programacion.getFechaFin(), programacion.isActivo(), programacion.getFechaCreacion());
    }
}
