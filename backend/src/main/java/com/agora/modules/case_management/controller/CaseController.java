package com.agora.modules.case_management.controller;

import com.agora.modules.case_management.dto.CaseBuilderResponse;
import com.agora.modules.case_management.dto.CaseRequest;
import com.agora.modules.case_management.dto.CaseResponse;
import com.agora.modules.case_management.service.CaseBuilderService;
import com.agora.modules.case_management.service.CaseService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
@Tag(name = "Cases")
@SecurityRequirement(name = "bearerAuth")
public class CaseController {

    private final CaseService caseService;
    private final CaseBuilderService builderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Create a case")
    public CaseResponse crear(@Valid @RequestBody CaseRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return caseService.crear(request, principal, clientIp(servletRequest));
    }

    @GetMapping
    @PreAuthorize(SecurityExpressions.CASE_READER)
    @Operation(summary = "List cases")
    public Page<CaseResponse> listar(@RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String nivelDificultad,
            @RequestParam(required = false) Long creadorId,
            @RequestParam(required = false) String rdaSearch,
            @PageableDefault(size = 20, sort = "id") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        return caseService.listar(activo, search, nivelDificultad, creadorId, rdaSearch, principal, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize(SecurityExpressions.CASE_READER)
    @Operation(summary = "Get a case")
    public CaseResponse consultar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return caseService.consultar(id, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Update a case")
    public CaseResponse actualizar(@PathVariable Long id, @Valid @RequestBody CaseRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return caseService.actualizar(id, request, principal, clientIp(servletRequest));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Activate a case")
    public CaseResponse activar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return caseService.activar(id, principal, clientIp(servletRequest));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Deactivate a case")
    public CaseResponse desactivar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return caseService.desactivar(id, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Delete a case without attempts")
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        caseService.eliminar(id, principal, clientIp(servletRequest));
    }

    @GetMapping("/{id}/builder")
    @PreAuthorize(SecurityExpressions.CASE_READER)
    @Operation(summary = "Get complete case builder structure")
    public CaseBuilderResponse builder(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return builderService.obtener(id, principal);
    }

    @PostMapping("/{id}/tools/{toolId}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Link a tool to a case")
    public CaseResponse asociarHerramienta(@PathVariable Long id, @PathVariable Long toolId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return caseService.asociarHerramienta(id, toolId, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/{id}/tools/{toolId}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Unlink a tool from a case")
    public CaseResponse desasociarHerramienta(@PathVariable Long id, @PathVariable Long toolId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return caseService.desasociarHerramienta(id, toolId, principal, clientIp(servletRequest));
    }

    @PostMapping("/{id}/entities/{entityId}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Link an institutional entity to a case")
    public CaseResponse asociarEntidad(@PathVariable Long id, @PathVariable Long entityId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return caseService.asociarEntidad(id, entityId, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/{id}/entities/{entityId}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Unlink an institutional entity from a case")
    public CaseResponse desasociarEntidad(@PathVariable Long id, @PathVariable Long entityId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return caseService.desasociarEntidad(id, entityId, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
