package com.agora.modules.academic.controller;

import com.agora.modules.academic.dto.CreateScheduleRequest;
import com.agora.modules.academic.dto.ScheduleResponse;
import com.agora.modules.academic.dto.UpdateScheduleRequest;
import com.agora.modules.academic.service.ScheduleService;
import com.agora.security.SecurityExpressions;
import com.agora.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Tag(name = "Academic Schedules")
@SecurityRequirement(name = "bearerAuth")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(SecurityExpressions.TEACHER_ACTIVITY)
    @Operation(summary = "Create an academic schedule for a group owned by the authenticated teacher")
    public ScheduleResponse crear(@Valid @RequestBody CreateScheduleRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return scheduleService.crear(request, principal, clientIp(servletRequest));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "List academic schedules visible to the authenticated user")
    public Page<ScheduleResponse> listar(
            @RequestParam(required = false) Long grupoId,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant hasta,
            @PageableDefault(size = 20, sort = "id") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        return scheduleService.listar(grupoId, activo, desde, hasta, principal, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "Get an academic schedule by id")
    public ScheduleResponse consultar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return scheduleService.consultar(id, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize(SecurityExpressions.TEACHER_ACTIVITY)
    @Operation(summary = "Update an academic schedule owned by the authenticated teacher")
    public ScheduleResponse actualizar(@PathVariable Long id, @Valid @RequestBody UpdateScheduleRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return scheduleService.actualizar(id, request, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr()
                : forwarded.split(",")[0].trim();
    }
}
