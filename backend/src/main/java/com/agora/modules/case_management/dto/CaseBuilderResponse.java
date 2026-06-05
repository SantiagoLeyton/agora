package com.agora.modules.case_management.dto;

import java.util.List;

public record CaseBuilderResponse(
        CaseResponse caso,
        List<BuilderSceneResponse> escenas,
        List<ToolResponse> herramientas,
        List<InstitutionalEntityResponse> entidades) {

    public record BuilderSceneResponse(SceneResponse escena, List<BuilderQuestionResponse> preguntas) {
    }

    public record BuilderQuestionResponse(QuestionResponse pregunta, List<OptionResponse> opciones) {
    }
}
