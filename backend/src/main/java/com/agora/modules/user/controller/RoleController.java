package com.agora.modules.user.controller;

import com.agora.modules.user.dto.RoleResponse;
import com.agora.modules.user.service.RoleQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Roles")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {

    private final RoleQueryService roleQueryService;

    @GetMapping
    @Operation(summary = "List available roles")
    public List<RoleResponse> listar() {
        return roleQueryService.listar();
    }
}
