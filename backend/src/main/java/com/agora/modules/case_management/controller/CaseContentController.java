package com.agora.modules.case_management.controller;

import com.agora.modules.case_management.dto.OptionRequest;
import com.agora.modules.case_management.dto.OptionResponse;
import com.agora.modules.case_management.dto.QuestionRequest;
import com.agora.modules.case_management.dto.QuestionResponse;
import com.agora.modules.case_management.dto.SceneRequest;
import com.agora.modules.case_management.dto.SceneResponse;
import com.agora.modules.case_management.service.CaseContentService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Case Content")
@SecurityRequirement(name = "bearerAuth")
public class CaseContentController {

    private final CaseContentService contentService;

    @PostMapping("/api/v1/cases/{caseId}/scenes")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Create a scene")
    public SceneResponse crearEscena(@PathVariable Long caseId, @Valid @RequestBody SceneRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return contentService.crearEscena(caseId, request, principal, clientIp(servletRequest));
    }

    @GetMapping("/api/v1/cases/{caseId}/scenes")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "List scenes for a case")
    public List<SceneResponse> listarEscenas(@PathVariable Long caseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return contentService.listarEscenas(caseId, principal);
    }

    @PutMapping("/api/v1/scenes/{id}")
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Update a scene")
    public SceneResponse actualizarEscena(@PathVariable Long id, @Valid @RequestBody SceneRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return contentService.actualizarEscena(id, request, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/api/v1/scenes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Delete a scene")
    public void eliminarEscena(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        contentService.eliminarEscena(id, principal, clientIp(servletRequest));
    }

    @PostMapping("/api/v1/scenes/{sceneId}/questions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Create a question")
    public QuestionResponse crearPregunta(@PathVariable Long sceneId, @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return contentService.crearPregunta(sceneId, request, principal, clientIp(servletRequest));
    }

    @GetMapping("/api/v1/scenes/{sceneId}/questions")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "List questions for a scene")
    public List<QuestionResponse> listarPreguntas(@PathVariable Long sceneId) {
        return contentService.listarPreguntas(sceneId);
    }

    @PutMapping("/api/v1/questions/{id}")
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Update a question")
    public QuestionResponse actualizarPregunta(@PathVariable Long id, @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return contentService.actualizarPregunta(id, request, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/api/v1/questions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Delete a question")
    public void eliminarPregunta(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        contentService.eliminarPregunta(id, principal, clientIp(servletRequest));
    }

    @PostMapping("/api/v1/questions/{questionId}/options")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Create an option")
    public OptionResponse crearOpcion(@PathVariable Long questionId, @Valid @RequestBody OptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return contentService.crearOpcion(questionId, request, principal, clientIp(servletRequest));
    }

    @GetMapping("/api/v1/questions/{questionId}/options")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','DOCENTE','ESTUDIANTE')")
    @Operation(summary = "List options for a question")
    public List<OptionResponse> listarOpciones(@PathVariable Long questionId) {
        return contentService.listarOpciones(questionId);
    }

    @PutMapping("/api/v1/options/{id}")
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Update an option")
    public OptionResponse actualizarOpcion(@PathVariable Long id, @Valid @RequestBody OptionRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return contentService.actualizarOpcion(id, request, principal, clientIp(servletRequest));
    }

    @DeleteMapping("/api/v1/options/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('DOCENTE')")
    @Operation(summary = "Delete an option")
    public void eliminarOpcion(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        contentService.eliminarOpcion(id, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
