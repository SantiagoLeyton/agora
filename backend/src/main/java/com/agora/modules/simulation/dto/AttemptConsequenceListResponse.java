package com.agora.modules.simulation.dto;

import java.util.List;

public record AttemptConsequenceListResponse(Long attemptId, List<AttemptConsequenceResponse> consecuencias) {
}
