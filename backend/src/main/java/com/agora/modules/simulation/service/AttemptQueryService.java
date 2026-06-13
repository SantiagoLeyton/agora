package com.agora.modules.simulation.service;

import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.dto.AttemptResponse;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttemptQueryService {

    private final IntentoRepository intentoRepository;
    private final AttemptAccessService accessService;

    @Transactional(readOnly = true)
    public Page<AttemptResponse> listar(UserPrincipal principal, Pageable pageable) {
        return switch (principal.rol()) {
            case "ADMINISTRADOR" -> intentoRepository.findAll(pageable).map(AttemptResponse::from);
            case "DOCENTE" -> intentoRepository.findVisibleForTeacher(principal.id(), pageable)
                    .map(AttemptResponse::from);
            case "DOCENTE_ADMIN" -> intentoRepository.findVisibleForTeacherAdmin(principal.id(), pageable)
                    .map(AttemptResponse::from);
            case "ESTUDIANTE" -> intentoRepository.findByEstudianteId(principal.id(), pageable)
                    .map(AttemptResponse::from);
            default -> Page.empty(pageable);
        };
    }

    @Transactional(readOnly = true)
    public AttemptResponse obtener(Long attemptId, UserPrincipal principal) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        return AttemptResponse.from(intento);
    }
}
