package com.agora.modules.academic.controller;

import com.agora.modules.academic.dto.CreateGroupRequest;
import com.agora.modules.academic.dto.GroupResponse;
import com.agora.modules.academic.dto.UpdateGroupRequest;
import com.agora.modules.academic.service.GroupService;
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
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@Tag(name = "Academic Groups")
@SecurityRequirement(name = "bearerAuth")
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(SecurityExpressions.TEACHER_ACTIVITY)
    @Operation(summary = "Create an academic group owned by the authenticated teacher")
    public GroupResponse crear(@Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return groupService.crear(request, principal, clientIp(servletRequest));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "List academic groups visible to the authenticated user")
    public Page<GroupResponse> listar(
            @RequestParam(required = false) String periodo,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "id") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        return groupService.listar(periodo, activo, search, principal, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "Get an academic group by id")
    public GroupResponse consultar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return groupService.consultar(id, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize(SecurityExpressions.TEACHER_ACTIVITY)
    @Operation(summary = "Update an academic group owned by the authenticated teacher")
    public GroupResponse actualizar(@PathVariable Long id, @Valid @RequestBody UpdateGroupRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return groupService.actualizar(id, request, principal, clientIp(servletRequest));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize(SecurityExpressions.TEACHER_ACTIVITY)
    @Operation(summary = "Activate an academic group owned by the authenticated teacher")
    public GroupResponse activar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return groupService.activar(id, principal, clientIp(servletRequest));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize(SecurityExpressions.TEACHER_ACTIVITY)
    @Operation(summary = "Deactivate an academic group owned by the authenticated teacher")
    public GroupResponse desactivar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return groupService.desactivar(id, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr()
                : forwarded.split(",")[0].trim();
    }
}
