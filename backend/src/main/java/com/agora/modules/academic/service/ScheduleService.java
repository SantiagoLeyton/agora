package com.agora.modules.academic.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.academic.dto.CreateScheduleRequest;
import com.agora.modules.academic.dto.ScheduleResponse;
import com.agora.modules.academic.dto.UpdateScheduleRequest;
import com.agora.modules.academic.repository.GrupoRepository;
import com.agora.modules.academic.repository.ProgramacionRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private static final String ACADEMIC_MODULE = "ACADEMIC";

    private final ProgramacionRepository programacionRepository;
    private final GrupoRepository grupoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AcademicAccessService accessService;
    private final OperationalAuditService auditService;

    @Transactional
    public ScheduleResponse crear(CreateScheduleRequest request, UserPrincipal principal, String ip) {
        Usuario docente = buscarUsuario(principal.id());
        Grupo grupo = buscarGrupo(request.grupoId());
        accessService.requireTeacherOwner(grupo, principal);
        validarFechas(request.fechaInicio(), request.fechaFin());
        Programacion programacion = programacionRepository.save(new Programacion(grupo, docente, request.casoId(),
                request.fechaInicio(), request.fechaFin()));
        auditService.registrar(docente, "SCHEDULE_CREATED", ACADEMIC_MODULE,
                "Programacion creada para grupo: " + grupo.getId(), ip);
        return ScheduleResponse.from(programacion);
    }

    @Transactional(readOnly = true)
    public Page<ScheduleResponse> listar(Long grupoId, Boolean activo, Instant desde, Instant hasta,
            UserPrincipal principal, Pageable pageable) {
        return programacionRepository.findAll(filtrar(grupoId, activo, desde, hasta, principal), pageable)
                .map(ScheduleResponse::from);
    }

    @Transactional(readOnly = true)
    public ScheduleResponse consultar(Long id, UserPrincipal principal) {
        Programacion programacion = buscarProgramacion(id);
        accessService.requireReadable(programacion, principal);
        return ScheduleResponse.from(programacion);
    }

    @Transactional
    public ScheduleResponse actualizar(Long id, UpdateScheduleRequest request, UserPrincipal principal, String ip) {
        Programacion programacion = buscarProgramacion(id);
        accessService.requireTeacherOwner(programacion, principal);
        Grupo grupo = buscarGrupo(request.grupoId());
        accessService.requireTeacherOwner(grupo, principal);
        validarFechas(request.fechaInicio(), request.fechaFin());
        programacion.actualizar(grupo, request.casoId(), request.fechaInicio(), request.fechaFin(), request.activo());
        Programacion guardada = programacionRepository.save(programacion);
        auditService.registrar(buscarUsuario(principal.id()), "SCHEDULE_UPDATED", ACADEMIC_MODULE,
                "Programacion actualizada: " + guardada.getId(), ip);
        return ScheduleResponse.from(guardada);
    }

    private Specification<Programacion> filtrar(
            Long grupoId, Boolean activo, Instant desde, Instant hasta, UserPrincipal principal) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (grupoId != null) {
                predicates.add(builder.equal(root.get("grupo").get("id"), grupoId));
            }
            if (activo != null) {
                predicates.add(builder.equal(root.get("activo"), activo));
            }
            if (desde != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("fechaInicio"), desde));
            }
            if (hasta != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("fechaFin"), hasta));
            }
            if (accessService.isTeacher(principal)) {
                predicates.add(builder.equal(root.get("docente").get("id"), principal.id()));
            } else if (accessService.isStudent(principal)) {
                query.distinct(true);
                predicates.add(builder.equal(root.join("grupo").join("estudiantes", JoinType.INNER)
                        .get("estudiante").get("id"), principal.id()));
            } else if (!accessService.isAdmin(principal)) {
                throw new AccessDeniedException("Rol no autorizado");
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void validarFechas(Instant fechaInicio, Instant fechaFin) {
        if (!fechaInicio.isBefore(fechaFin)) {
            throw new BusinessRuleException("La fecha de inicio debe ser anterior a la fecha de fin");
        }
    }

    private Programacion buscarProgramacion(Long id) {
        return programacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programacion no encontrada"));
    }

    private Grupo buscarGrupo(Long id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
