package com.agora.modules.auth.service;

import com.agora.modules.auth.domain.Auditoria;
import com.agora.modules.auth.dto.AuditResponse;
import com.agora.modules.auth.repository.AuditoriaRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
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
public class AuditQueryService {

    private final AuditoriaRepository auditoriaRepository;

    @Transactional(readOnly = true)
    public Page<AuditResponse> listar(Long usuarioId, String accion, String modulo, Instant desde, Instant hasta,
            Pageable pageable) {
        return auditoriaRepository.findAll(filtrar(usuarioId, accion, modulo, desde, hasta), pageable)
                .map(AuditResponse::from);
    }

    private Specification<Auditoria> filtrar(
            Long usuarioId, String accion, String modulo, Instant desde, Instant hasta) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (usuarioId != null) {
                predicates.add(builder.equal(root.get("usuario").get("id"), usuarioId));
            }
            if (accion != null && !accion.isBlank()) {
                predicates.add(builder.equal(root.get("accion"), accion));
            }
            if (modulo != null && !modulo.isBlank()) {
                predicates.add(builder.equal(root.get("modulo"), modulo));
            }
            if (desde != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("fechaEvento"), desde));
            }
            if (hasta != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("fechaEvento"), hasta));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
