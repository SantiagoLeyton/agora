package com.agora.modules.academic.dto;

import com.agora.modules.academic.domain.GrupoDocente;
import java.time.Instant;

public record GroupTeacherResponse(
        Long id,
        String nombre,
        String apellido,
        String correo,
        boolean titular,
        Instant fechaAsignacion) {

    public static GroupTeacherResponse titular(com.agora.modules.academic.domain.Grupo grupo) {
        return new GroupTeacherResponse(
                grupo.getDocente().getId(),
                grupo.getDocente().getNombre(),
                grupo.getDocente().getApellido(),
                grupo.getDocente().getCorreo(),
                true,
                grupo.getFechaCreacion());
    }

    public static GroupTeacherResponse from(GrupoDocente relacion) {
        return new GroupTeacherResponse(
                relacion.getDocente().getId(),
                relacion.getDocente().getNombre(),
                relacion.getDocente().getApellido(),
                relacion.getDocente().getCorreo(),
                false,
                relacion.getFechaAsignacion());
    }
}
