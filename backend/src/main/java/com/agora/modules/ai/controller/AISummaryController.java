package com.agora.modules.ai.controller;

import com.agora.modules.ai.dto.AISummaryHistoryResponse;
import com.agora.modules.ai.dto.AISummaryRequest;
import com.agora.modules.ai.dto.AISummaryResponse;
import com.agora.modules.ai.service.AISummaryService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attempts/{attemptId}/ai")
@RequiredArgsConstructor
@Tag(name = "AI Summaries")
@SecurityRequirement(name = "bearerAuth")
public class AISummaryController {

    private final AISummaryService aiSummaryService;

    @PostMapping("/summary")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','ESTUDIANTE')")
    @Operation(summary = "Generate an AI summary using the configured provider")
    public AISummaryResponse generar(@PathVariable Long attemptId, @Valid @RequestBody AISummaryRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return aiSummaryService.generar(attemptId, request, principal, clientIp(servletRequest));
    }

    @GetMapping("/summary")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "List previous AI summaries for an attempt")
    public AISummaryHistoryResponse listar(@PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return aiSummaryService.listar(attemptId, principal);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
