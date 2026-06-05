package com.agora.modules.academic.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.GrupoEstudiante;
import com.agora.modules.academic.domain.GrupoEstudianteId;
import com.agora.modules.academic.dto.AddGroupStudentRequest;
import com.agora.modules.academic.dto.CreateGroupRequest;
import com.agora.modules.academic.dto.GroupResponse;
import com.agora.modules.academic.dto.GroupStudentResponse;
import com.agora.modules.academic.dto.UpdateGroupRequest;
import com.agora.modules.academic.repository.GrupoEstudianteRepository;
import com.agora.modules.academic.repository.GrupoRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ConflictException;
import com.agora.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
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
public class GroupService {

    private static final String ACADEMIC_MODULE = "ACADEMIC";

    private final GrupoRepository grupoRepository;
    private final GrupoEstudianteRepository grupoEstudianteRepository;
    private final UsuarioRepository usuarioRepository;
    private final AcademicAccessService accessService;
    private final OperationalAuditService auditService;

    @Transactional
    public GroupResponse crear(CreateGroupRequest request, UserPrincipal principal, String ip) {
        Usuario docente = buscarUsuario(principal.id());
        validarRol(docente, AcademicAccessService.TEACHER, "El usuario autenticado no es docente");
        Grupo grupo = grupoRepository.save(new Grupo(docente, request.nombre(), request.descripcion(), request.periodo()));
        auditService.registrar(docente, "GROUP_CREATED", ACADEMIC_MODULE, "Grupo creado: " + grupo.getNombre(), ip);
        return GroupResponse.from(grupo);
    }

    @Transactional(readOnly = true)
    public Page<GroupResponse> listar(String periodo, Boolean activo, String search, UserPrincipal principal,
            Pageable pageable) {
        return grupoRepository.findAll(filtrar(periodo, activo, search, principal), pageable)
                .map(GroupResponse::from);
    }

    @Transactional(readOnly = true)
    public GroupResponse consultar(Long id, UserPrincipal principal) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireReadable(grupo, principal);
        return GroupResponse.from(grupo);
    }

    @Transactional
    public GroupResponse actualizar(Long id, UpdateGroupRequest request, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireTeacherOwner(grupo, principal);
        grupo.actualizar(request.nombre(), request.descripcion(), request.periodo());
        Grupo guardado = grupoRepository.save(grupo);
        auditService.registrar(buscarUsuario(principal.id()), "GROUP_UPDATED", ACADEMIC_MODULE,
                "Grupo actualizado: " + guardado.getNombre(), ip);
        return GroupResponse.from(guardado);
    }

    @Transactional
    public GroupResponse activar(Long id, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireTeacherOwner(grupo, principal);
        grupo.activar();
        Grupo guardado = grupoRepository.save(grupo);
        auditService.registrar(buscarUsuario(principal.id()), "GROUP_ACTIVATED", ACADEMIC_MODULE,
                "Grupo activado: " + guardado.getNombre(), ip);
        return GroupResponse.from(guardado);
    }

    @Transactional
    public GroupResponse desactivar(Long id, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireTeacherOwner(grupo, principal);
        grupo.desactivar();
        Grupo guardado = grupoRepository.save(grupo);
        auditService.registrar(buscarUsuario(principal.id()), "GROUP_DEACTIVATED", ACADEMIC_MODULE,
                "Grupo desactivado: " + guardado.getNombre(), ip);
        return GroupResponse.from(guardado);
    }

    @Transactional
    public GroupStudentResponse agregarEstudiante(
            Long groupId, AddGroupStudentRequest request, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireTeacherOwner(grupo, principal);
        Usuario estudiante = buscarUsuario(request.estudianteId());
        validarRol(estudiante, AcademicAccessService.STUDENT, "El usuario no tiene rol ESTUDIANTE");
        if (grupoEstudianteRepository.existsByGrupoIdAndEstudianteId(groupId, estudiante.getId())) {
            throw new ConflictException("El estudiante ya pertenece al grupo");
        }
        GrupoEstudiante relacion = grupoEstudianteRepository.save(new GrupoEstudiante(grupo, estudiante));
        auditService.registrar(buscarUsuario(principal.id()), "STUDENT_ADDED_TO_GROUP", ACADEMIC_MODULE,
                "Estudiante agregado al grupo: " + estudiante.getCorreo(), ip);
        return GroupStudentResponse.from(relacion);
    }

    @Transactional
    public void eliminarEstudiante(Long groupId, Long estudianteId, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireTeacherOwner(grupo, principal);
        GrupoEstudianteId id = new GrupoEstudianteId(groupId, estudianteId);
        GrupoEstudiante relacion = grupoEstudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado en el grupo"));
        grupoEstudianteRepository.delete(relacion);
        auditService.registrar(buscarUsuario(principal.id()), "STUDENT_REMOVED_FROM_GROUP", ACADEMIC_MODULE,
                "Estudiante removido del grupo: " + estudianteId, ip);
    }

    @Transactional(readOnly = true)
    public List<GroupStudentResponse> listarEstudiantes(Long groupId, UserPrincipal principal) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireReadable(grupo, principal);
        return grupoEstudianteRepository.findByGrupoIdOrderByFechaIngresoAsc(groupId).stream()
                .map(GroupStudentResponse::from)
                .toList();
    }

    private Specification<Grupo> filtrar(String periodo, Boolean activo, String search, UserPrincipal principal) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (periodo != null && !periodo.isBlank()) {
                predicates.add(builder.equal(root.get("periodo"), periodo));
            }
            if (activo != null) {
                predicates.add(builder.equal(root.get("activo"), activo));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("nombre")), pattern),
                        builder.like(builder.lower(root.get("descripcion")), pattern)));
            }
            if (accessService.isTeacher(principal)) {
                predicates.add(builder.equal(root.get("docente").get("id"), principal.id()));
            } else if (accessService.isStudent(principal)) {
                query.distinct(true);
                predicates.add(builder.equal(root.join("estudiantes", JoinType.INNER).get("estudiante").get("id"),
                        principal.id()));
            } else if (!accessService.isAdmin(principal)) {
                throw new AccessDeniedException("Rol no autorizado");
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Grupo buscarGrupo(Long id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private void validarRol(Usuario usuario, String rol, String message) {
        if (!rol.equals(usuario.getRol().getNombre())) {
            throw new BusinessRuleException(message);
        }
    }
}
