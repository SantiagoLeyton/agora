package com.agora.modules.metrics.controller;

import com.agora.modules.metrics.service.PedagogicalAnalyticsService;
import com.agora.modules.simulation.dto.AcademicProgressResponse;
import com.agora.modules.simulation.dto.RdaAttemptEvaluationResponse;
import com.agora.modules.simulation.service.RdaEvaluationService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Pedagogical Analytics")
@SecurityRequirement(name = "bearerAuth")
public class PedagogicalAnalyticsController {

    private final PedagogicalAnalyticsService analyticsService;
    private final RdaEvaluationService rdaEvaluationService;

    @GetMapping("/api/v1/academic-progress/me")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Get longitudinal academic progress for the authenticated student")
    public AcademicProgressResponse progresoPropio(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.progresoPropio(principal);
    }

    @GetMapping("/api/v1/academic-progress/students/{studentId}")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PROGRESS)
    @Operation(summary = "Get longitudinal academic progress for a student")
    public AcademicProgressResponse progresoEstudiante(@PathVariable Long studentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.progresoEstudiante(studentId, principal);
    }

    @GetMapping("/api/v1/attempts/{attemptId}/rda-evaluation")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "Evaluate learning outcomes for an attempt")
    public RdaAttemptEvaluationResponse evaluarRda(@PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return rdaEvaluationService.evaluarIntento(attemptId, principal);
    }
}
