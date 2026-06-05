package com.agora.modules.auth.controller;

import com.agora.modules.auth.dto.AuditResponse;
import com.agora.modules.auth.service.AuditQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "Audit")
@SecurityRequirement(name = "bearerAuth")
public class AuditController {

    private final AuditQueryService auditQueryService;

    @GetMapping
    @Operation(summary = "List audit events with pagination and filters")
    public Page<AuditResponse> listar(
            @RequestParam(required = false) Long usuario,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant hasta,
            @PageableDefault(size = 20, sort = "fechaEvento") Pageable pageable) {
        return auditQueryService.listar(usuario, accion, modulo, desde, hasta, pageable);
    }
}
