package com.agora.modules.user.controller;

import com.agora.modules.user.dto.ChangePasswordRequest;
import com.agora.modules.user.dto.CreateUserRequest;
import com.agora.modules.user.dto.UpdateUserRequest;
import com.agora.modules.user.dto.UserResponse;
import com.agora.modules.user.service.UserAdminService;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users")
@SecurityRequirement(name = "bearerAuth")
public class UserAdminController {

    private final UserAdminService userAdminService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a user")
    public UserResponse crear(@Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return userAdminService.crear(request, principal.id(), clientIp(servletRequest));
    }

    @GetMapping
    @Operation(summary = "List users with pagination and filters")
    public Page<UserResponse> listar(
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return userAdminService.listar(rol, activo, search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user by id")
    public UserResponse consultar(@PathVariable Long id) {
        return userAdminService.consultar(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user")
    public UserResponse actualizar(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return userAdminService.actualizar(id, request, principal.id(), clientIp(servletRequest));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a user")
    public UserResponse activar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return userAdminService.activar(id, principal.id(), clientIp(servletRequest));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a user")
    public UserResponse desactivar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return userAdminService.desactivar(id, principal.id(), clientIp(servletRequest));
    }

    @PatchMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Change a user's password and revoke active refresh tokens")
    public void cambiarPassword(@PathVariable Long id, @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        userAdminService.cambiarPassword(id, request, principal.id(), clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr()
                : forwarded.split(",")[0].trim();
    }
}
