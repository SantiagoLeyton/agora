package com.agora.modules.simulation.controller;

import com.agora.modules.simulation.dto.AnswerResponse;
import com.agora.modules.simulation.dto.AnswerSimulationRequest;
import com.agora.modules.simulation.dto.SimulationResponse;
import com.agora.modules.simulation.dto.SimulationStartedResponse;
import com.agora.modules.simulation.dto.SimulationStateResponse;
import com.agora.modules.simulation.dto.StartSimulationRequest;
import com.agora.modules.simulation.service.SimulationService;
import com.agora.security.SecurityExpressions;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/simulations")
@RequiredArgsConstructor
@Tag(name = "Simulations")
@SecurityRequirement(name = "bearerAuth")
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Start a deterministic simulation")
    public SimulationStartedResponse iniciar(@Valid @RequestBody StartSimulationRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return simulationService.iniciar(request, principal, clientIp(servletRequest));
    }

    @GetMapping("/{id}")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "Get a simulation attempt")
    public SimulationResponse consultar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return simulationService.consultar(id, principal);
    }

    @PostMapping("/{id}/answer")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Submit an answer and apply deterministic consequences")
    public AnswerResponse responder(@PathVariable Long id, @Valid @RequestBody AnswerSimulationRequest request,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        return simulationService.responder(id, request, principal, clientIp(servletRequest));
    }

    @GetMapping("/{id}/states")
    @PreAuthorize(SecurityExpressions.ACADEMIC_PARTICIPANT)
    @Operation(summary = "Get current emotional states for a simulation")
    public List<SimulationStateResponse> estados(@PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return simulationService.consultarEstados(id, principal);
    }

    @PostMapping("/{id}/finish")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Finish a simulation")
    public SimulationResponse finalizar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return simulationService.finalizar(id, principal, clientIp(servletRequest));
    }

    @PostMapping("/{id}/abandon")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Abandon a simulation")
    public SimulationResponse abandonar(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        return simulationService.abandonar(id, principal, clientIp(servletRequest));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
