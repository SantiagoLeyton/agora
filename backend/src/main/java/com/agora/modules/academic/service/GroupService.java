package com.agora.modules.academic.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.GrupoDocente;
import com.agora.modules.academic.domain.GrupoEstudiante;
import com.agora.modules.academic.domain.GrupoEstudianteId;
import com.agora.modules.academic.dto.AddGroupStudentRequest;
import com.agora.modules.academic.dto.AddGroupTeacherRequest;
import com.agora.modules.academic.dto.BatchGroupStudentFailure;
import com.agora.modules.academic.dto.BatchGroupStudentsRequest;
import com.agora.modules.academic.dto.BatchGroupStudentsResponse;
import com.agora.modules.academic.dto.CreateGroupRequest;
import com.agora.modules.academic.dto.GroupResponse;
import com.agora.modules.academic.dto.GroupStudentResponse;
import com.agora.modules.academic.dto.GroupTeacherResponse;
import com.agora.modules.academic.dto.JoinGroupRequest;
import com.agora.modules.academic.dto.UpdateGroupRequest;
import com.agora.modules.academic.repository.GrupoDocenteRepository;
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
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
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
    private static final int MAX_DOCENTES = 2;

    private final GrupoRepository grupoRepository;
    private final GrupoEstudianteRepository grupoEstudianteRepository;
    private final GrupoDocenteRepository grupoDocenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final AcademicAccessService accessService;
    private final OperationalAuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public GroupResponse crear(CreateGroupRequest request, UserPrincipal principal, String ip) {
        Usuario docente = resolverDocente(request.docenteId(), principal);
        String clave = resolverClave(request.claveAcceso(), request.nombre(), null);
        Grupo grupo = grupoRepository.save(new Grupo(docente, request.nombre(), request.descripcion(), request.periodo(), clave));
        auditService.registrar(docente, "GROUP_CREATED", ACADEMIC_MODULE, "Grupo creado: " + grupo.getNombre(), ip);
        return mapear(grupo, principal, true);
    }

    @Transactional(readOnly = true)
    public Page<GroupResponse> listar(
            String periodo, Boolean activo, String search, String scope, UserPrincipal principal, Pageable pageable) {
        return grupoRepository.findAll(filtrar(periodo, activo, search, scope, principal), pageable)
                .map(grupo -> mapear(grupo, principal, calcularInscrito(grupo, principal)));
    }

    @Transactional(readOnly = true)
    public GroupResponse consultar(Long id, UserPrincipal principal) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireReadable(grupo, principal);
        return mapear(grupo, principal, calcularInscrito(grupo, principal));
    }

    @Transactional
    public GroupResponse actualizar(Long id, UpdateGroupRequest request, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireTeacherOwner(grupo, principal);
        String clave = request.claveAcceso() == null || request.claveAcceso().isBlank()
                ? null
                : resolverClave(request.claveAcceso(), request.nombre(), grupo.getId());
        grupo.actualizar(request.nombre(), request.descripcion(), request.periodo(), clave);
        if (accessService.isAdmin(principal) && request.docenteId() != null) {
            Usuario docente = resolverDocente(request.docenteId(), principal);
            grupo.cambiarDocente(docente);
        }
        Grupo guardado = grupoRepository.save(grupo);
        auditService.registrar(buscarUsuario(principal.id()), "GROUP_UPDATED", ACADEMIC_MODULE,
                "Grupo actualizado: " + guardado.getNombre(), ip);
        return mapear(guardado, principal, calcularInscrito(guardado, principal));
    }

    @Transactional
    public GroupResponse activar(Long id, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireTeacherOwner(grupo, principal);
        grupo.activar();
        Grupo guardado = grupoRepository.save(grupo);
        auditService.registrar(buscarUsuario(principal.id()), "GROUP_ACTIVATED", ACADEMIC_MODULE,
                "Grupo activado: " + guardado.getNombre(), ip);
        return mapear(guardado, principal, calcularInscrito(guardado, principal));
    }

    @Transactional
    public GroupResponse desactivar(Long id, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireTeacherOwner(grupo, principal);
        grupo.desactivar();
        Grupo guardado = grupoRepository.save(grupo);
        auditService.registrar(buscarUsuario(principal.id()), "GROUP_DEACTIVATED", ACADEMIC_MODULE,
                "Grupo desactivado: " + guardado.getNombre(), ip);
        return mapear(guardado, principal, calcularInscrito(guardado, principal));
    }

    @Transactional
    public GroupResponse unirseConClave(JoinGroupRequest request, UserPrincipal principal, String ip) {
        if (accessService.isAdmin(principal)) {
            throw new BusinessRuleException("El administrador accede a los cursos sin clave");
        }
        Grupo grupo = grupoRepository.findByClaveAccesoIgnoreCase(normalizarClave(request.claveAcceso()))
                .orElseThrow(() -> new ResourceNotFoundException("Clave de acceso invalida"));
        if (!grupo.isActivo()) {
            throw new BusinessRuleException("El curso no esta activo");
        }
        Usuario usuario = buscarUsuario(principal.id());
        if (accessService.isStudent(principal)) {
            matricularEstudiante(grupo, usuario, principal, ip, false);
        } else if (accessService.isTeacher(principal)) {
            asignarDocenteConClave(grupo, usuario, principal, ip);
        } else {
            throw new AccessDeniedException("Rol no autorizado para unirse al curso");
        }
        return mapear(grupo, principal, true);
    }

    @Transactional
    public GroupStudentResponse agregarEstudiante(
            Long groupId, AddGroupStudentRequest request, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireTeacherOwner(grupo, principal);
        Usuario estudiante = buscarUsuario(request.estudianteId());
        return matricularEstudiante(grupo, estudiante, principal, ip, true);
    }

    @Transactional
    public BatchGroupStudentsResponse agregarEstudiantesBatch(
            Long groupId, BatchGroupStudentsRequest request, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireTeacherOwner(grupo, principal);
        List<GroupStudentResponse> agregados = new ArrayList<>();
        List<BatchGroupStudentFailure> fallidos = new ArrayList<>();
        for (Long estudianteId : request.estudianteIds()) {
            try {
                Usuario estudiante = buscarUsuario(estudianteId);
                agregados.add(matricularEstudiante(grupo, estudiante, principal, ip, true));
            } catch (RuntimeException error) {
                fallidos.add(new BatchGroupStudentFailure(estudianteId, error.getMessage()));
            }
        }
        return new BatchGroupStudentsResponse(agregados, List.of(), fallidos);
    }

    @Transactional
    public void eliminarEstudiante(Long groupId, Long estudianteId, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireTeacherOwner(grupo, principal);
        removerEstudiante(grupo, estudianteId, principal, ip);
    }

    @Transactional
    public BatchGroupStudentsResponse eliminarEstudiantesBatch(
            Long groupId, BatchGroupStudentsRequest request, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireTeacherOwner(grupo, principal);
        List<Long> removidos = new ArrayList<>();
        List<BatchGroupStudentFailure> fallidos = new ArrayList<>();
        for (Long estudianteId : request.estudianteIds()) {
            try {
                removerEstudiante(grupo, estudianteId, principal, ip);
                removidos.add(estudianteId);
            } catch (RuntimeException error) {
                fallidos.add(new BatchGroupStudentFailure(estudianteId, error.getMessage()));
            }
        }
        return new BatchGroupStudentsResponse(List.of(), removidos, fallidos);
    }

    @Transactional
    public GroupTeacherResponse agregarDocente(
            Long groupId, AddGroupTeacherRequest request, UserPrincipal principal, String ip) {
        if (!accessService.isAdmin(principal)) {
            throw new AccessDeniedException("Solo el administrador puede asignar docentes directamente");
        }
        Grupo grupo = buscarGrupo(groupId);
        Usuario docente = buscarUsuario(request.docenteId());
        validarRolDocente(docente);
        if (accessService.isTeacherAssigned(grupo, docente.getId())) {
            throw new ConflictException("El docente ya esta asignado al curso");
        }
        validarCupoDocentes(grupo);
        GrupoDocente relacion = grupoDocenteRepository.save(new GrupoDocente(grupo, docente));
        auditService.registrar(buscarUsuario(principal.id()), "TEACHER_ADDED_TO_GROUP", ACADEMIC_MODULE,
                "Docente asignado al curso: " + docente.getCorreo(), ip);
        return GroupTeacherResponse.from(relacion);
    }

    @Transactional
    public void eliminarDocente(Long groupId, Long docenteId, UserPrincipal principal, String ip) {
        if (!accessService.isAdmin(principal)) {
            throw new AccessDeniedException("Solo el administrador puede remover docentes directamente");
        }
        Grupo grupo = buscarGrupo(groupId);
        if (grupo.getDocente().getId().equals(docenteId)) {
            throw new BusinessRuleException("No se puede remover al docente titular desde esta operacion");
        }
        if (!grupoDocenteRepository.existsByGrupoIdAndDocenteId(groupId, docenteId)) {
            throw new ResourceNotFoundException("Docente no encontrado en el curso");
        }
        grupoDocenteRepository.deleteById(new com.agora.modules.academic.domain.GrupoDocenteId(groupId, docenteId));
        auditService.registrar(buscarUsuario(principal.id()), "TEACHER_REMOVED_FROM_GROUP", ACADEMIC_MODULE,
                "Docente removido del curso: " + docenteId, ip);
    }

    @Transactional(readOnly = true)
    public List<GroupTeacherResponse> listarDocentes(Long groupId, UserPrincipal principal) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireReadable(grupo, principal);
        List<GroupTeacherResponse> docentes = new ArrayList<>();
        docentes.add(GroupTeacherResponse.titular(grupo));
        grupoDocenteRepository.findByGrupoIdOrderByFechaAsignacionAsc(groupId).stream()
                .map(GroupTeacherResponse::from)
                .forEach(docentes::add);
        return docentes;
    }

    @Transactional(readOnly = true)
    public List<GroupStudentResponse> listarEstudiantes(Long groupId, UserPrincipal principal) {
        Grupo grupo = buscarGrupo(groupId);
        accessService.requireReadable(grupo, principal);
        return grupoEstudianteRepository.findByGrupoIdOrderByFechaIngresoAsc(groupId).stream()
                .map(GroupStudentResponse::from)
                .toList();
    }

    @Transactional
    public void eliminar(Long id, UserPrincipal principal, String ip) {
        Grupo grupo = buscarGrupo(id);
        accessService.requireTeacherOwner(grupo, principal);
        if (!grupo.getEstudiantes().isEmpty()) {
            throw new BusinessRuleException("No se puede eliminar un curso con estudiantes matriculados. Desactivalo.");
        }
        grupoRepository.delete(grupo);
        auditService.registrar(buscarUsuario(principal.id()), "GROUP_DELETED", ACADEMIC_MODULE,
                "Curso eliminado: " + grupo.getNombre(), ip);
    }

    private GroupStudentResponse matricularEstudiante(
            Grupo grupo, Usuario estudiante, UserPrincipal principal, String ip, boolean auditIndividual) {
        validarRol(estudiante, AcademicAccessService.STUDENT, "El usuario no tiene rol ESTUDIANTE");
        if (grupoEstudianteRepository.existsByGrupoIdAndEstudianteId(grupo.getId(), estudiante.getId())) {
            throw new ConflictException("El estudiante ya pertenece al grupo");
        }
        GrupoEstudiante relacion = grupoEstudianteRepository.save(new GrupoEstudiante(grupo, estudiante));
        if (auditIndividual) {
            auditService.registrar(buscarUsuario(principal.id()), "STUDENT_ADDED_TO_GROUP", ACADEMIC_MODULE,
                    "Estudiante agregado al grupo: " + estudiante.getCorreo(), ip);
        }
        return GroupStudentResponse.from(relacion);
    }

    private void removerEstudiante(Grupo grupo, Long estudianteId, UserPrincipal principal, String ip) {
        GrupoEstudianteId id = new GrupoEstudianteId(grupo.getId(), estudianteId);
        GrupoEstudiante relacion = grupoEstudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado en el grupo"));
        grupoEstudianteRepository.delete(relacion);
        auditService.registrar(buscarUsuario(principal.id()), "STUDENT_REMOVED_FROM_GROUP", ACADEMIC_MODULE,
                "Estudiante removido del grupo: " + estudianteId, ip);
    }

    private void asignarDocenteConClave(Grupo grupo, Usuario docente, UserPrincipal principal, String ip) {
        validarRolDocente(docente);
        if (accessService.isTeacherAssigned(grupo, docente.getId())) {
            return;
        }
        validarCupoDocentes(grupo);
        grupoDocenteRepository.save(new GrupoDocente(grupo, docente));
        auditService.registrar(docente, "TEACHER_JOINED_GROUP", ACADEMIC_MODULE,
                "Docente ingreso al curso con clave: " + grupo.getNombre(), ip);
    }

    private void validarCupoDocentes(Grupo grupo) {
        int asignados = 1 + (int) grupoDocenteRepository.countByGrupoId(grupo.getId());
        if (asignados >= MAX_DOCENTES) {
            throw new BusinessRuleException("El curso ya tiene el maximo de docentes permitidos (2)");
        }
    }

    private Specification<Grupo> filtrar(
            String periodo, Boolean activo, String search, String scope, UserPrincipal principal) {
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

            String normalizedScope = scope == null || scope.isBlank() ? "mis" : scope.toLowerCase(Locale.ROOT);
            if (accessService.isAdmin(principal)) {
                if ("explorar".equals(normalizedScope)) {
                    predicates.add(builder.equal(root.get("activo"), true));
                }
            } else if (accessService.isTeacher(principal)) {
                predicates.add(filtroDocente(root, query, builder, principal.id(), normalizedScope));
            } else if (accessService.isStudent(principal)) {
                predicates.add(filtroEstudiante(root, query, builder, principal.id(), normalizedScope));
            } else {
                throw new AccessDeniedException("Rol no autorizado");
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Predicate filtroDocente(
            Root<Grupo> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder builder,
            Long docenteId,
            String scope) {
        Subquery<Long> coTeacher = query.subquery(Long.class);
        Root<GrupoDocente> coRoot = coTeacher.from(GrupoDocente.class);
        coTeacher.select(coRoot.get("grupo").get("id"));
        coTeacher.where(builder.equal(coRoot.get("docente").get("id"), docenteId));

        Predicate assigned = builder.or(
                builder.equal(root.get("docente").get("id"), docenteId),
                root.get("id").in(coTeacher));

        if ("explorar".equals(scope)) {
            return builder.and(builder.equal(root.get("activo"), true), builder.not(assigned));
        }
        return assigned;
    }

    private Predicate filtroEstudiante(
            Root<Grupo> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder builder,
            Long estudianteId,
            String scope) {
        query.distinct(true);
        Subquery<Long> enrolled = query.subquery(Long.class);
        Root<GrupoEstudiante> enrollmentRoot = enrolled.from(GrupoEstudiante.class);
        enrolled.select(enrollmentRoot.get("grupo").get("id"));
        enrolled.where(builder.equal(enrollmentRoot.get("estudiante").get("id"), estudianteId));

        if ("explorar".equals(scope)) {
            return builder.and(builder.equal(root.get("activo"), true), builder.not(root.get("id").in(enrolled)));
        }
        return root.get("id").in(enrolled);
    }

    private boolean calcularInscrito(Grupo grupo, UserPrincipal principal) {
        if (accessService.isAdmin(principal)) {
            return true;
        }
        if (accessService.isStudent(principal)) {
            return accessService.isMember(grupo, principal);
        }
        if (accessService.isTeacher(principal)) {
            return accessService.isTeacherAssigned(grupo, principal.id());
        }
        return false;
    }

    private GroupResponse mapear(Grupo grupo, UserPrincipal principal, boolean inscrito) {
        Set<Long> docenteIds = new LinkedHashSet<>();
        docenteIds.add(grupo.getDocente().getId());
        grupoDocenteRepository.findByGrupoIdOrderByFechaAsignacionAsc(grupo.getId()).forEach(relacion ->
                docenteIds.add(relacion.getDocente().getId()));
        String clave = accessService.canExposeAccessKey(principal) && (accessService.isAdmin(principal)
                || accessService.isTeacherAssigned(grupo, principal.id()))
                ? grupo.getClaveAcceso()
                : null;
        return GroupResponse.from(grupo, List.copyOf(docenteIds), clave, inscrito);
    }

    private String resolverClave(String requested, String nombre, Long grupoId) {
        String clave = requested == null || requested.isBlank() ? generarClave(nombre) : normalizarClave(requested);
        if (grupoRepository.existsByClaveAccesoIgnoreCaseAndIdNot(clave, grupoId == null ? -1L : grupoId)) {
            throw new ConflictException("La clave de acceso ya esta en uso");
        }
        return clave;
    }

    private String generarClave(String nombre) {
        String base = normalizarClave(nombre.replaceAll("[^A-Za-z0-9]", ""));
        if (base.length() < 4) {
            base = "AGORA";
        }
        base = base.substring(0, Math.min(base.length(), 8));
        return base + "-" + (1000 + secureRandom.nextInt(9000));
    }

    private String normalizarClave(String clave) {
        return clave.trim().toUpperCase(Locale.ROOT);
    }

    private Grupo buscarGrupo(Long id) {
        return grupoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private Usuario resolverDocente(Long docenteId, UserPrincipal principal) {
        if (accessService.isAdmin(principal)) {
            if (docenteId == null) {
                throw new BusinessRuleException("Debe asignar un docente al curso");
            }
            Usuario docente = buscarUsuario(docenteId);
            validarRolDocente(docente);
            return docente;
        }
        Usuario docente = buscarUsuario(principal.id());
        if (!accessService.isTeacher(principal)) {
            throw new BusinessRuleException("El usuario autenticado no es docente");
        }
        return docente;
    }

    private void validarRolDocente(Usuario docente) {
        validarRol(docente, AcademicAccessService.TEACHER, "El docente asignado no tiene rol docente");
    }

    private void validarRol(Usuario usuario, String rol, String message) {
        if (!rol.equals(usuario.getRol().getNombre())
                && !(AcademicAccessService.TEACHER_ADMIN.equals(usuario.getRol().getNombre())
                        && AcademicAccessService.TEACHER.equals(rol))) {
            throw new BusinessRuleException(message);
        }
    }
}
