package com.agora.modules.case_management.service;

import com.agora.modules.case_management.domain.EntidadInstitucional;
import com.agora.modules.case_management.domain.Herramienta;
import com.agora.modules.case_management.dto.InstitutionalEntityRequest;
import com.agora.modules.case_management.dto.InstitutionalEntityResponse;
import com.agora.modules.case_management.dto.ToolRequest;
import com.agora.modules.case_management.dto.ToolResponse;
import com.agora.modules.case_management.repository.EntidadInstitucionalRepository;
import com.agora.modules.case_management.repository.HerramientaRepository;
import com.agora.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CaseResourceService {

    private final HerramientaRepository herramientaRepository;
    private final EntidadInstitucionalRepository entidadRepository;

    @Transactional
    public ToolResponse crearHerramienta(ToolRequest request) {
        return ToolResponse.from(herramientaRepository.save(new Herramienta(request.nombre(), request.descripcion(),
                request.tipo())));
    }

    @Transactional(readOnly = true)
    public Page<ToolResponse> listarHerramientas(Boolean activo, String search, Pageable pageable) {
        return herramientaRepository.findAll(filtrarHerramienta(activo, search), pageable).map(ToolResponse::from);
    }

    @Transactional(readOnly = true)
    public ToolResponse consultarHerramienta(Long id) {
        return ToolResponse.from(buscarHerramienta(id));
    }

    @Transactional
    public ToolResponse actualizarHerramienta(Long id, ToolRequest request) {
        Herramienta herramienta = buscarHerramienta(id);
        herramienta.actualizar(request.nombre(), request.descripcion(), request.tipo(),
                request.activo() == null || request.activo());
        return ToolResponse.from(herramientaRepository.save(herramienta));
    }

    @Transactional
    public void eliminarHerramienta(Long id) {
        herramientaRepository.delete(buscarHerramienta(id));
    }

    @Transactional
    public InstitutionalEntityResponse crearEntidad(InstitutionalEntityRequest request) {
        return InstitutionalEntityResponse.from(entidadRepository.save(new EntidadInstitucional(request.nombre(),
                request.tipo(), request.descripcion())));
    }

    @Transactional(readOnly = true)
    public Page<InstitutionalEntityResponse> listarEntidades(Boolean activo, String search, Pageable pageable) {
        return entidadRepository.findAll(filtrarEntidad(activo, search), pageable).map(InstitutionalEntityResponse::from);
    }

    @Transactional(readOnly = true)
    public InstitutionalEntityResponse consultarEntidad(Long id) {
        return InstitutionalEntityResponse.from(buscarEntidad(id));
    }

    @Transactional
    public InstitutionalEntityResponse actualizarEntidad(Long id, InstitutionalEntityRequest request) {
        EntidadInstitucional entidad = buscarEntidad(id);
        entidad.actualizar(request.nombre(), request.tipo(), request.descripcion(),
                request.activo() == null || request.activo());
        return InstitutionalEntityResponse.from(entidadRepository.save(entidad));
    }

    @Transactional
    public void eliminarEntidad(Long id) {
        entidadRepository.delete(buscarEntidad(id));
    }

    private Herramienta buscarHerramienta(Long id) {
        return herramientaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));
    }

    private EntidadInstitucional buscarEntidad(Long id) {
        return entidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entidad institucional no encontrada"));
    }

    private Specification<Herramienta> filtrarHerramienta(Boolean activo, String search) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (activo != null) {
                predicates.add(builder.equal(root.get("activo"), activo));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(builder.like(builder.lower(root.get("nombre")), pattern));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Specification<EntidadInstitucional> filtrarEntidad(Boolean activo, String search) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (activo != null) {
                predicates.add(builder.equal(root.get("activo"), activo));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(builder.like(builder.lower(root.get("nombre")), pattern));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
