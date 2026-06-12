package com.agora.modules.simulation.controller;

import com.agora.modules.simulation.dto.AttemptSummaryResponse;
import com.agora.modules.simulation.dto.AttemptResponse;
import com.agora.modules.simulation.dto.CreateFeedbackRequest;
import com.agora.modules.simulation.dto.CreateJournalRequest;
import com.agora.modules.simulation.dto.FeedbackResponse;
import com.agora.modules.simulation.dto.JournalResponse;
import com.agora.modules.simulation.dto.UpdateJournalRequest;
import com.agora.modules.simulation.service.AttemptFeedbackService;
import com.agora.modules.simulation.service.AttemptJournalService;
import com.agora.modules.simulation.service.AttemptQueryService;
import com.agora.modules.simulation.service.AttemptSummaryService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attempts")
@RequiredArgsConstructor
@Tag(name = "Attempts")
@SecurityRequirement(name = "bearerAuth")
public class AttemptController {

    private final AttemptJournalService journalService;
    private final AttemptFeedbackService feedbackService;
    private final AttemptSummaryService summaryService;
    private final AttemptQueryService queryService;

    @GetMapping
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "List attempts visible to the authenticated user")
    public Page<AttemptResponse> listar(@AuthenticationPrincipal UserPrincipal principal, Pageable pageable) {
        return queryService.listar(principal, pageable);
    }

    @GetMapping("/{attemptId}")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "Get an attempt by id")
    public AttemptResponse obtener(@PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return queryService.obtener(attemptId, principal);
    }

    @PostMapping("/{attemptId}/journal")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Create a journal entry for an attempt")
    public JournalResponse crearBitacora(@PathVariable Long attemptId,
            @Valid @RequestBody CreateJournalRequest request, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return journalService.crear(attemptId, request, principal, clientIp(servletRequest));
    }

    @GetMapping("/{attemptId}/journal")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "List journal entries for an attempt")
    public List<JournalResponse> listarBitacora(@PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return journalService.listar(attemptId, principal);
    }

    @PutMapping("/{attemptId}/journal/{journalId}")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Update a journal entry")
    public JournalResponse actualizarBitacora(@PathVariable Long attemptId, @PathVariable Long journalId,
            @Valid @RequestBody UpdateJournalRequest request, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return journalService.actualizar(attemptId, journalId, request, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/{attemptId}/journal/{journalId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Delete a journal entry")
    public void eliminarBitacora(@PathVariable Long attemptId, @PathVariable Long journalId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        journalService.eliminar(attemptId, journalId, principal, clientIp(servletRequest));
    }

    @PostMapping("/{attemptId}/feedback")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(SecurityExpressions.TEACHER_FEEDBACK)
    @Operation(summary = "Create teacher feedback for an attempt")
    public FeedbackResponse crearFeedback(@PathVariable Long attemptId,
            @Valid @RequestBody CreateFeedbackRequest request, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return feedbackService.crearDocente(attemptId, request, principal, clientIp(servletRequest));
    }

    @GetMapping("/{attemptId}/feedback")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "List feedback for an attempt")
    public List<FeedbackResponse> listarFeedback(@PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return feedbackService.listar(attemptId, principal);
    }

    @GetMapping("/{attemptId}/summary")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "Get academic summary for an attempt")
    public AttemptSummaryResponse resumen(@PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return summaryService.obtener(attemptId, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
