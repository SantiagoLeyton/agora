package com.agora.modules.academic.controller;

import com.agora.modules.academic.dto.AddGroupStudentRequest;
import com.agora.modules.academic.dto.GroupStudentResponse;
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
@RequestMapping("/api/v1/groups/{groupId}/students")
@RequiredArgsConstructor
@Tag(name = "Group Students")
@SecurityRequirement(name = "bearerAuth")
public class GroupStudentController {

    private final GroupService groupService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Add a student to a group owned by the authenticated teacher")
    public GroupStudentResponse agregar(@PathVariable Long groupId, @Valid @RequestBody AddGroupStudentRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return groupService.agregarEstudiante(groupId, request, principal, clientIp(servletRequest));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Remove a student from a group owned by the authenticated teacher")
    public void eliminar(@PathVariable Long groupId, @RequestParam Long estudianteId,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        groupService.eliminarEstudiante(groupId, estudianteId, principal, clientIp(servletRequest));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "List students in a visible group")
    public List<GroupStudentResponse> listar(@PathVariable Long groupId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return groupService.listarEstudiantes(groupId, principal);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr()
                : forwarded.split(",")[0].trim();
    }
}
