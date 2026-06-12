package com.agora.modules.case_management.controller;

import com.agora.modules.case_management.dto.LearningOutcomeRequest;
import com.agora.modules.case_management.dto.LearningOutcomeResponse;
import com.agora.modules.case_management.service.LearningOutcomeService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Learning Outcomes")
@SecurityRequirement(name = "bearerAuth")
public class LearningOutcomeController {

    private final LearningOutcomeService learningOutcomeService;

    @GetMapping("/api/v1/cases/{caseId}/learning-outcomes")
    @PreAuthorize(SecurityExpressions.CASE_READER)
    @Operation(summary = "List learning outcomes for a case")
    public List<LearningOutcomeResponse> listar(@PathVariable Long caseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return learningOutcomeService.listar(caseId, principal);
    }

    @PostMapping("/api/v1/cases/{caseId}/learning-outcomes")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Create a learning outcome")
    public LearningOutcomeResponse crear(@PathVariable Long caseId, @Valid @RequestBody LearningOutcomeRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return learningOutcomeService.crear(caseId, request, principal, clientIp(servletRequest));
    }

    @PutMapping("/api/v1/cases/{caseId}/learning-outcomes/sync")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Replace all learning outcomes for a case")
    public List<LearningOutcomeResponse> sincronizar(@PathVariable Long caseId,
            @Valid @RequestBody List<LearningOutcomeRequest> requests,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return learningOutcomeService.sincronizar(caseId, requests, principal, clientIp(servletRequest));
    }

    @PutMapping("/api/v1/learning-outcomes/{id}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Update a learning outcome")
    public LearningOutcomeResponse actualizar(@PathVariable Long id, @Valid @RequestBody LearningOutcomeRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return learningOutcomeService.actualizar(id, request, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/api/v1/learning-outcomes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Delete a learning outcome")
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        learningOutcomeService.eliminar(id, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
