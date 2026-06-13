package com.agora.modules.academic.dto;

import java.util.List;

public record BatchGroupStudentsResponse(
        List<GroupStudentResponse> agregados,
        List<Long> removidos,
        List<BatchGroupStudentFailure> fallidos) {
}
