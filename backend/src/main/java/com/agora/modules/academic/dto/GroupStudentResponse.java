package com.agora.modules.academic.dto;

import com.agora.modules.academic.domain.GrupoEstudiante;
import java.time.Instant;

public record GroupStudentResponse(
        Long id,
        String nombre,
        String apellido,
        String correo,
        Instant fechaIngreso) {

    public static GroupStudentResponse from(GrupoEstudiante grupoEstudiante) {
        return new GroupStudentResponse(grupoEstudiante.getEstudiante().getId(),
                grupoEstudiante.getEstudiante().getNombre(), grupoEstudiante.getEstudiante().getApellido(),
                grupoEstudiante.getEstudiante().getCorreo(), grupoEstudiante.getFechaIngreso());
    }
}
