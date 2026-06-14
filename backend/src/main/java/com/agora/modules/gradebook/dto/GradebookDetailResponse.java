package com.agora.modules.gradebook.dto;

import com.agora.modules.simulation.dto.AttemptSummaryResponse;
import com.agora.modules.simulation.dto.PedagogicalAnalysisResponse;
import java.util.List;

public record GradebookDetailResponse(
        GradebookEntryResponse entry,
        AttemptSummaryResponse summary,
        PedagogicalAnalysisResponse analysis,
        List<GradebookHistoryItemResponse> historial) {
}
