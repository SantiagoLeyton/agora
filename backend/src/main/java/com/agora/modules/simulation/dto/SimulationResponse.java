package com.agora.modules.simulation.dto;

import com.agora.modules.case_management.dto.CaseResponse;
import com.agora.modules.case_management.dto.SceneResponse;
import java.util.List;

public record SimulationResponse(
        AttemptResponse intento,
        CaseResponse caso,
        SceneResponse escenaActual,
        List<SimulationStateResponse> estados) {
}
