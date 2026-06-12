package com.agora.modules.metrics.controller;

import com.agora.modules.metrics.dto.TeacherMetricsResponse;
import com.agora.modules.metrics.service.TeacherMetricsService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/teacher/metrics")
@RequiredArgsConstructor
@Tag(name = "Teacher Metrics")
@SecurityRequirement(name = "bearerAuth")
public class TeacherMetricsController {

    private final TeacherMetricsService teacherMetricsService;

    @GetMapping
    @PreAuthorize(SecurityExpressions.TEACHER_METRICS)
    @Operation(summary = "Get aggregated teacher metrics from existing simulation and academic data")
    public TeacherMetricsResponse obtener(
            @RequestParam(required = false) String periodo,
            @RequestParam(required = false) Long grupoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherMetricsService.obtener(periodo, grupoId, principal);
    }
}
