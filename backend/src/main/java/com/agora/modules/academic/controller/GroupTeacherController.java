package com.agora.modules.academic.controller;

import com.agora.modules.academic.dto.AddGroupTeacherRequest;
import com.agora.modules.academic.dto.GroupTeacherResponse;
import com.agora.modules.academic.service.GroupService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/groups/{groupId}/teachers")
@RequiredArgsConstructor
@Tag(name = "Group Teachers")
@SecurityRequirement(name = "bearerAuth")
public class GroupTeacherController {

    private final GroupService groupService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE_ADMIN','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "List teachers assigned to a group")
    public List<GroupTeacherResponse> listar(@PathVariable Long groupId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return groupService.listarDocentes(groupId, principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Assign a co-teacher to a group")
    public GroupTeacherResponse agregar(@PathVariable Long groupId, @Valid @RequestBody AddGroupTeacherRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return groupService.agregarDocente(groupId, request, principal, clientIp(servletRequest));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Remove a co-teacher from a group")
    public void eliminar(@PathVariable Long groupId, @RequestParam Long docenteId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        groupService.eliminarDocente(groupId, docenteId, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr()
                : forwarded.split(",")[0].trim();
    }
}
