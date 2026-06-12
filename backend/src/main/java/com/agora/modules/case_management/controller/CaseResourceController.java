package com.agora.modules.case_management.controller;

import com.agora.modules.case_management.dto.InstitutionalEntityRequest;
import com.agora.modules.case_management.dto.InstitutionalEntityResponse;
import com.agora.modules.case_management.dto.ToolRequest;
import com.agora.modules.case_management.dto.ToolResponse;
import com.agora.modules.case_management.service.CaseResourceService;
import com.agora.security.SecurityExpressions;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Case Resources")
@SecurityRequirement(name = "bearerAuth")
public class CaseResourceController {

    private final CaseResourceService resourceService;

    @PostMapping("/api/v1/tools")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Create a tool")
    public ToolResponse crearHerramienta(@Valid @RequestBody ToolRequest request) {
        return resourceService.crearHerramienta(request);
    }

    @GetMapping("/api/v1/tools")
    @PreAuthorize(SecurityExpressions.RESOURCE_READER)
    @Operation(summary = "List tools")
    public Page<ToolResponse> listarHerramientas(@RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String search, @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return resourceService.listarHerramientas(activo, search, pageable);
    }

    @GetMapping("/api/v1/tools/{id}")
    @PreAuthorize(SecurityExpressions.RESOURCE_READER)
    @Operation(summary = "Get a tool")
    public ToolResponse consultarHerramienta(@PathVariable Long id) {
        return resourceService.consultarHerramienta(id);
    }

    @PutMapping("/api/v1/tools/{id}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Update a tool")
    public ToolResponse actualizarHerramienta(@PathVariable Long id, @Valid @RequestBody ToolRequest request) {
        return resourceService.actualizarHerramienta(id, request);
    }

    @DeleteMapping("/api/v1/tools/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Delete a tool")
    public void eliminarHerramienta(@PathVariable Long id) {
        resourceService.eliminarHerramienta(id);
    }

    @PostMapping("/api/v1/institutional-entities")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Create an institutional entity")
    public InstitutionalEntityResponse crearEntidad(@Valid @RequestBody InstitutionalEntityRequest request) {
        return resourceService.crearEntidad(request);
    }

    @GetMapping("/api/v1/institutional-entities")
    @PreAuthorize(SecurityExpressions.RESOURCE_READER)
    @Operation(summary = "List institutional entities")
    public Page<InstitutionalEntityResponse> listarEntidades(@RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String search, @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return resourceService.listarEntidades(activo, search, pageable);
    }

    @GetMapping("/api/v1/institutional-entities/{id}")
    @PreAuthorize(SecurityExpressions.RESOURCE_READER)
    @Operation(summary = "Get an institutional entity")
    public InstitutionalEntityResponse consultarEntidad(@PathVariable Long id) {
        return resourceService.consultarEntidad(id);
    }

    @PutMapping("/api/v1/institutional-entities/{id}")
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Update an institutional entity")
    public InstitutionalEntityResponse actualizarEntidad(@PathVariable Long id,
            @Valid @RequestBody InstitutionalEntityRequest request) {
        return resourceService.actualizarEntidad(id, request);
    }

    @DeleteMapping("/api/v1/institutional-entities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize(SecurityExpressions.CASE_MANAGER)
    @Operation(summary = "Delete an institutional entity")
    public void eliminarEntidad(@PathVariable Long id) {
        resourceService.eliminarEntidad(id);
    }
}
