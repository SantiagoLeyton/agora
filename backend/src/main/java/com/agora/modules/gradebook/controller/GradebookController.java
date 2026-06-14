package com.agora.modules.gradebook.controller;

import com.agora.modules.gradebook.dto.GradebookAnalyticsResponse;
import com.agora.modules.gradebook.dto.GradebookDetailResponse;
import com.agora.modules.gradebook.dto.GradebookEntryResponse;
import com.agora.modules.gradebook.dto.GradebookFilterRequest;
import com.agora.modules.gradebook.service.GradebookExportService;
import com.agora.modules.gradebook.service.GradebookService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gradebook")
@RequiredArgsConstructor
@Tag(name = "Gradebook")
@SecurityRequirement(name = "bearerAuth")
public class GradebookController {

    private final GradebookService gradebookService;
    private final GradebookExportService exportService;

    @GetMapping("/entries")
    @PreAuthorize(SecurityExpressions.GRADEBOOK_VIEWER)
    @Operation(summary = "List gradebook entries visible to the authenticated staff user")
    public Page<GradebookEntryResponse> listar(
            @RequestParam(required = false) Long grupoId,
            @RequestParam(required = false) Long casoId,
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant hasta,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) BigDecimal notaMinima,
            @RequestParam(required = false) BigDecimal notaMaxima,
            @PageableDefault(size = 20, sort = "id") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        return gradebookService.listar(
                new GradebookFilterRequest(grupoId, casoId, estudianteId, desde, hasta, estado, notaMinima, notaMaxima),
                principal,
                pageable);
    }

    @GetMapping("/analytics")
    @PreAuthorize(SecurityExpressions.GRADEBOOK_VIEWER)
    @Operation(summary = "Get gradebook analytics for the current filter scope")
    public GradebookAnalyticsResponse analitica(
            @RequestParam(required = false) Long grupoId,
            @RequestParam(required = false) Long casoId,
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant hasta,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) BigDecimal notaMinima,
            @RequestParam(required = false) BigDecimal notaMaxima,
            @AuthenticationPrincipal UserPrincipal principal) {
        return gradebookService.analitica(
                new GradebookFilterRequest(grupoId, casoId, estudianteId, desde, hasta, estado, notaMinima, notaMaxima),
                principal);
    }

    @GetMapping("/entries/{attemptId}/detail")
    @PreAuthorize(SecurityExpressions.GRADEBOOK_VIEWER)
    @Operation(summary = "Get detailed gradebook view for an attempt")
    public GradebookDetailResponse detalle(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return gradebookService.detalle(attemptId, principal, servletRequest);
    }

    @GetMapping("/export")
    @PreAuthorize(SecurityExpressions.GRADEBOOK_VIEWER)
    @Operation(summary = "Export gradebook rows as CSV or Excel")
    public ResponseEntity<byte[]> exportar(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) Long grupoId,
            @RequestParam(required = false) Long casoId,
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant hasta,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) BigDecimal notaMinima,
            @RequestParam(required = false) BigDecimal notaMaxima,
            @AuthenticationPrincipal UserPrincipal principal) {
        GradebookFilterRequest filters =
                new GradebookFilterRequest(grupoId, casoId, estudianteId, desde, hasta, estado, notaMinima, notaMaxima);
        List<GradebookEntryResponse> rows = gradebookService.exportRows(filters, principal);
        if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
            byte[] content = exportService.exportExcel(rows);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=calificaciones.xlsx")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(content);
        }
        byte[] content = exportService.exportCsv(rows);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=calificaciones.csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(content);
    }
}
