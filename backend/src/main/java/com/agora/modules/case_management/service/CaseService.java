package com.agora.modules.case_management.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.academic.repository.ProgramacionRepository;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.EntidadInstitucional;
import com.agora.modules.case_management.domain.Herramienta;
import com.agora.modules.case_management.domain.ResultadoAprendizaje;
import com.agora.modules.case_management.dto.CaseRequest;
import com.agora.modules.case_management.dto.CaseResponse;
import com.agora.modules.case_management.dto.LearningOutcomeResponse;
import com.agora.modules.case_management.repository.CasoRepository;
import com.agora.modules.case_management.repository.EntidadInstitucionalRepository;
import com.agora.modules.case_management.repository.HerramientaRepository;
import com.agora.modules.case_management.repository.ResultadoAprendizajeRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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
public class CaseService {

    private static final String MODULE = "CASE_MANAGEMENT";

    private final CasoRepository casoRepository;
    private final HerramientaRepository herramientaRepository;
    private final EntidadInstitucionalRepository entidadRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResultadoAprendizajeRepository resultadoRepository;
    private final ProgramacionRepository programacionRepository;
    private final OperationalAuditService auditService;

    private static final String MENSAJE_SIN_PROGRAMACION =
            "Este caso aun no tiene una programacion activa para presentacion.";

    @Transactional
    public CaseResponse crear(CaseRequest request, UserPrincipal principal, String ip) {
        Usuario creador = buscarUsuario(principal.id());
        Caso caso = casoRepository.save(new Caso(request.titulo(), request.descripcion(), request.objetivo(),
                request.nivelDificultad(), request.duracionEstimada(), creador));
        audit(principal, "CASE_CREATED", "Caso creado: " + caso.getTitulo(), ip);
        return enriquecer(caso);
    }

    @Transactional(readOnly = true)
    public Page<CaseResponse> listar(Boolean activo, String search, String nivelDificultad, Long creadorId,
            String rdaSearch, UserPrincipal principal, Pageable pageable) {
        return casoRepository.findAll(filtrar(activo, search, nivelDificultad, creadorId, rdaSearch, principal), pageable)
                .map(caso -> enriquecer(caso, principal));
    }

    @Transactional(readOnly = true)
    public CaseResponse consultar(Long id, UserPrincipal principal) {
        Caso caso = buscarCaso(id);
        validarLectura(caso, principal);
        return enriquecer(caso, principal);
    }

    @Transactional
    public CaseResponse actualizar(Long id, CaseRequest request, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        caso.actualizar(request.titulo(), request.descripcion(), request.objetivo(), request.nivelDificultad(),
                request.duracionEstimada());
        audit(principal, "CASE_UPDATED", "Caso actualizado: " + caso.getTitulo(), ip);
        return enriquecer(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse activar(Long id, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        caso.activar();
        audit(principal, "CASE_ACTIVATED", "Caso activado: " + caso.getTitulo(), ip);
        return enriquecer(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse desactivar(Long id, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        caso.desactivar();
        audit(principal, "CASE_DEACTIVATED", "Caso desactivado: " + caso.getTitulo(), ip);
        return enriquecer(casoRepository.save(caso));
    }

    @Transactional
    public void eliminar(Long id, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        if (casoRepository.hasAttempts(id) || casoRepository.hasProgramaciones(id)) {
            throw new BusinessRuleException(
                    "No se puede eliminar el caso porque tiene intentos o programaciones registradas. Desactivalo en su lugar.");
        }
        casoRepository.delete(caso);
        audit(principal, "CASE_DELETED", "Caso eliminado: " + caso.getTitulo(), ip);
    }

    @Transactional
    public CaseResponse asociarHerramienta(Long id, Long herramientaId, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        Herramienta herramienta = herramientaRepository.findById(herramientaId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));
        caso.asociar(herramienta);
        audit(principal, "TOOL_LINKED", "Herramienta asociada al caso: " + herramienta.getId(), ip);
        return enriquecer(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse desasociarHerramienta(Long id, Long herramientaId, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        Herramienta herramienta = herramientaRepository.findById(herramientaId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));
        caso.desasociar(herramienta);
        audit(principal, "TOOL_UNLINKED", "Herramienta desasociada del caso: " + herramienta.getId(), ip);
        return enriquecer(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse asociarEntidad(Long id, Long entidadId, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        EntidadInstitucional entidad = entidadRepository.findById(entidadId)
                .orElseThrow(() -> new ResourceNotFoundException("Entidad institucional no encontrada"));
        caso.asociar(entidad);
        audit(principal, "ENTITY_LINKED", "Entidad asociada al caso: " + entidad.getId(), ip);
        return enriquecer(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse desasociarEntidad(Long id, Long entidadId, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        EntidadInstitucional entidad = entidadRepository.findById(entidadId)
                .orElseThrow(() -> new ResourceNotFoundException("Entidad institucional no encontrada"));
        caso.desasociar(entidad);
        audit(principal, "ENTITY_UNLINKED", "Entidad desasociada del caso: " + entidad.getId(), ip);
        return enriquecer(casoRepository.save(caso));
    }

    Caso buscarCaso(Long id) {
        return casoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Caso no encontrado"));
    }

    void validarLectura(Caso caso, UserPrincipal principal) {
        if ("ESTUDIANTE".equals(principal.rol())) {
            if (!caso.isActivo()) {
                throw new AccessDeniedException("El caso no esta activo");
            }
            if (!programacionRepository.existsVisibleForStudent(caso.getId(), principal.id())) {
                throw new AccessDeniedException("No tiene acceso academico a este caso");
            }
        }
    }

    private CaseResponse enriquecer(Caso caso) {
        return enriquecer(caso, null);
    }

    private CaseResponse enriquecer(Caso caso, UserPrincipal principal) {
        List<LearningOutcomeResponse> resultados = resultadoRepository.findByCasoIdOrderByOrdenAsc(caso.getId())
                .stream()
                .map(LearningOutcomeResponse::from)
                .toList();
        if (principal != null && "ESTUDIANTE".equals(principal.rol())) {
            Long programacionActivaId = programacionRepository
                    .findActivePresentationId(caso.getId(), principal.id(), Instant.now())
                    .orElse(null);
            boolean presentable = programacionActivaId != null;
            return CaseResponse.from(
                    caso,
                    resultados,
                    programacionActivaId,
                    presentable,
                    presentable ? null : MENSAJE_SIN_PROGRAMACION);
        }
        return CaseResponse.from(caso, resultados);
    }

    private Specification<Caso> filtrar(Boolean activo, String search, String nivelDificultad, Long creadorId,
            String rdaSearch, UserPrincipal principal) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if ("ESTUDIANTE".equals(principal.rol())) {
                predicates.add(builder.equal(root.get("activo"), true));
                predicates.add(casoVisibleParaEstudiante(root, query, builder, principal.id()));
            } else if (activo != null) {
                predicates.add(builder.equal(root.get("activo"), activo));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(builder.or(builder.like(builder.lower(root.get("titulo")), pattern),
                        builder.like(builder.lower(root.get("descripcion")), pattern)));
            }
            if (nivelDificultad != null && !nivelDificultad.isBlank()) {
                predicates.add(builder.equal(builder.upper(root.get("nivelDificultad")),
                        nivelDificultad.trim().toUpperCase()));
            }
            if (creadorId != null) {
                predicates.add(builder.equal(root.get("creador").get("id"), creadorId));
            }
            if (rdaSearch != null && !rdaSearch.isBlank()) {
                String pattern = "%" + rdaSearch.toLowerCase() + "%";
                Subquery<Long> subquery = query.subquery(Long.class);
                var rdaRoot = subquery.from(ResultadoAprendizaje.class);
                subquery.select(rdaRoot.get("caso").get("id"));
                subquery.where(builder.like(builder.lower(rdaRoot.get("descripcion")), pattern));
                predicates.add(root.get("id").in(subquery));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Predicate casoVisibleParaEstudiante(
            Root<Caso> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder builder,
            Long estudianteId) {
        Subquery<Long> subquery = query.subquery(Long.class);
        Root<Programacion> programacionRoot = subquery.from(Programacion.class);
        var grupoJoin = programacionRoot.join("grupo");
        var estudianteJoin = grupoJoin.join("estudiantes");
        subquery.select(programacionRoot.get("casoId"));
        subquery.where(
                builder.equal(programacionRoot.get("casoId"), root.get("id")),
                builder.isNotNull(programacionRoot.get("casoId")),
                builder.equal(estudianteJoin.get("estudiante").get("id"), estudianteId),
                builder.or(
                        builder.isNull(programacionRoot.get("estudiante")),
                        builder.equal(programacionRoot.get("estudiante").get("id"), estudianteId)));
        return builder.exists(subquery);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
    }

    private void audit(UserPrincipal principal, String accion, String descripcion, String ip) {
        auditService.registrar(buscarUsuario(principal.id()), accion, MODULE, descripcion, ip);
    }
}
