package com.agora.modules.case_management.dto;

import com.agora.modules.case_management.domain.Pregunta;

public record QuestionResponse(Long id, Long escenaId, String enunciado, boolean obligatoria, boolean activo) {

    public static QuestionResponse from(Pregunta pregunta) {
        return new QuestionResponse(pregunta.getId(), pregunta.getEscena().getId(), pregunta.getEnunciado(),
                pregunta.isObligatoria(), pregunta.isActivo());
    }
}
