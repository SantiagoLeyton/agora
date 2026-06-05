package com.agora.modules.case_management.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.EntidadInstitucional;
import com.agora.modules.case_management.domain.Herramienta;
import com.agora.modules.case_management.dto.CaseRequest;
import com.agora.modules.case_management.dto.CaseResponse;
import com.agora.modules.case_management.repository.CasoRepository;
import com.agora.modules.case_management.repository.EntidadInstitucionalRepository;
import com.agora.modules.case_management.repository.HerramientaRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.ResourceNotFoundException;
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
public class CaseService {

    private static final String MODULE = "CASE_MANAGEMENT";

    private final CasoRepository casoRepository;
    private final HerramientaRepository herramientaRepository;
    private final EntidadInstitucionalRepository entidadRepository;
    private final UsuarioRepository usuarioRepository;
    private final OperationalAuditService auditService;

    @Transactional
    public CaseResponse crear(CaseRequest request, UserPrincipal principal, String ip) {
        Caso caso = casoRepository.save(new Caso(request.titulo(), request.descripcion(), request.objetivo(),
                request.nivelDificultad(), request.duracionEstimada()));
        audit(principal, "CASE_CREATED", "Caso creado: " + caso.getTitulo(), ip);
        return CaseResponse.from(caso);
    }

    @Transactional(readOnly = true)
    public Page<CaseResponse> listar(Boolean activo, String search, UserPrincipal principal, Pageable pageable) {
        return casoRepository.findAll(filtrar(activo, search, principal), pageable).map(CaseResponse::from);
    }

    @Transactional(readOnly = true)
    public CaseResponse consultar(Long id, UserPrincipal principal) {
        Caso caso = buscarCaso(id);
        validarLectura(caso, principal);
        return CaseResponse.from(caso);
    }

    @Transactional
    public CaseResponse actualizar(Long id, CaseRequest request, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        caso.actualizar(request.titulo(), request.descripcion(), request.objetivo(), request.nivelDificultad(),
                request.duracionEstimada());
        audit(principal, "CASE_UPDATED", "Caso actualizado: " + caso.getTitulo(), ip);
        return CaseResponse.from(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse activar(Long id, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        caso.activar();
        audit(principal, "CASE_ACTIVATED", "Caso activado: " + caso.getTitulo(), ip);
        return CaseResponse.from(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse desactivar(Long id, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        caso.desactivar();
        audit(principal, "CASE_DEACTIVATED", "Caso desactivado: " + caso.getTitulo(), ip);
        return CaseResponse.from(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse asociarHerramienta(Long id, Long herramientaId, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        Herramienta herramienta = herramientaRepository.findById(herramientaId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));
        caso.asociar(herramienta);
        audit(principal, "TOOL_LINKED", "Herramienta asociada al caso: " + herramienta.getId(), ip);
        return CaseResponse.from(casoRepository.save(caso));
    }

    @Transactional
    public CaseResponse asociarEntidad(Long id, Long entidadId, UserPrincipal principal, String ip) {
        Caso caso = buscarCaso(id);
        EntidadInstitucional entidad = entidadRepository.findById(entidadId)
                .orElseThrow(() -> new ResourceNotFoundException("Entidad institucional no encontrada"));
        caso.asociar(entidad);
        audit(principal, "ENTITY_LINKED", "Entidad asociada al caso: " + entidad.getId(), ip);
        return CaseResponse.from(casoRepository.save(caso));
    }

    Caso buscarCaso(Long id) {
        return casoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Caso no encontrado"));
    }

    void validarLectura(Caso caso, UserPrincipal principal) {
        if ("ESTUDIANTE".equals(principal.rol()) && !caso.isActivo()) {
            throw new AccessDeniedException("El caso no esta activo");
        }
    }

    private Specification<Caso> filtrar(Boolean activo, String search, UserPrincipal principal) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if ("ESTUDIANTE".equals(principal.rol())) {
                predicates.add(builder.equal(root.get("activo"), true));
            } else if (activo != null) {
                predicates.add(builder.equal(root.get("activo"), activo));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(builder.or(builder.like(builder.lower(root.get("titulo")), pattern),
                        builder.like(builder.lower(root.get("descripcion")), pattern)));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void audit(UserPrincipal principal, String accion, String descripcion, String ip) {
        Usuario actor = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
        auditService.registrar(actor, accion, MODULE, descripcion, ip);
    }
}
