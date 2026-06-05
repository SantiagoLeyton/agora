package com.agora.modules.auth.dto;

import com.agora.modules.auth.domain.Auditoria;
import java.time.Instant;

public record AuditResponse(
        Long id,
        Long usuarioId,
        String usuarioCorreo,
        String accion,
        String modulo,
        String descripcion,
        String ip,
        Instant fechaEvento) {

    public static AuditResponse from(Auditoria auditoria) {
        return new AuditResponse(auditoria.getId(),
                auditoria.getUsuario() == null ? null : auditoria.getUsuario().getId(),
                auditoria.getUsuario() == null ? null : auditoria.getUsuario().getCorreo(),
                auditoria.getAccion(), auditoria.getModulo(), auditoria.getDescripcion(), auditoria.getIp(),
                auditoria.getFechaEvento());
    }
}
