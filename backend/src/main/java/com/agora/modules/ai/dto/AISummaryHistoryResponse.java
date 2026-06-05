package com.agora.modules.ai.dto;

import java.util.List;

public record AISummaryHistoryResponse(
        Long intentoId,
        List<AISummaryResponse> sintesis) {
}
