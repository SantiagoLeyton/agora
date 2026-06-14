package com.agora.modules.gradebook.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record GradebookEntryResponse(
        Long attemptId,
        Long estudianteId,
        String estudianteNombre,
        String estudianteCorreo,
        Long grupoId,
        String grupoNombre,
        Long casoId,
        String casoTitulo,
        Long programacionId,
        Instant fechaPresentacion,
        String estado,
        BigDecimal notaFinal,
        int rdaCumplidos,
        int rdaParciales,
        int rdaPendientes,
        String feedbackDocente,
        String feedbackIa,
        boolean aprobado) {
}
