package com.agora.modules.simulation.dto;

import com.agora.modules.case_management.dto.CaseResponse;
import java.util.List;

public record AttemptSummaryResponse(
        AttemptResponse intento,
        CaseResponse caso,
        List<AttemptAnswerResponse> respuestas,
        List<SimulationStateResponse> estados,
        List<JournalResponse> bitacoras,
        List<FeedbackResponse> retroalimentaciones) {
}
