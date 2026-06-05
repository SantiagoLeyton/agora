package com.agora.modules.simulation.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.simulation.domain.Bitacora;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.SimulationStatus;
import com.agora.modules.simulation.dto.CreateJournalRequest;
import com.agora.modules.simulation.dto.JournalResponse;
import com.agora.modules.simulation.dto.UpdateJournalRequest;
import com.agora.modules.simulation.repository.BitacoraRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttemptJournalService {

    private static final String MODULE = "SIMULATION";

    private final BitacoraRepository bitacoraRepository;
    private final AttemptAccessService accessService;
    private final OperationalAuditService auditService;

    @Transactional
    public JournalResponse crear(Long attemptId, CreateJournalRequest request, UserPrincipal principal, String ip) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarEstudiantePropietario(intento, principal);
        if (intento.getEstado() == SimulationStatus.ABANDONADO) {
            throw new BusinessRuleException("No se puede crear bitacora en un intento abandonado");
        }
        Bitacora bitacora = bitacoraRepository.save(new Bitacora(intento, request.titulo(), request.contenido()));
        audit(accessService.actor(principal), "JOURNAL_CREATED", "Bitacora creada: " + bitacora.getId(), ip);
        return JournalResponse.from(bitacora);
    }

    @Transactional(readOnly = true)
    public List<JournalResponse> listar(Long attemptId, UserPrincipal principal) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        return bitacoraRepository.findByIntentoIdOrderByFechaRegistroAsc(attemptId).stream()
                .map(JournalResponse::from)
                .toList();
    }

    @Transactional
    public JournalResponse actualizar(Long attemptId, Long journalId, UpdateJournalRequest request,
            UserPrincipal principal, String ip) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarEstudiantePropietario(intento, principal);
        Bitacora bitacora = buscarBitacora(attemptId, journalId);
        bitacora.actualizar(request.titulo(), request.contenido());
        Bitacora guardada = bitacoraRepository.save(bitacora);
        audit(accessService.actor(principal), "JOURNAL_UPDATED", "Bitacora actualizada: " + journalId, ip);
        return JournalResponse.from(guardada);
    }

    @Transactional
    public void eliminar(Long attemptId, Long journalId, UserPrincipal principal, String ip) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarEstudiantePropietario(intento, principal);
        Bitacora bitacora = buscarBitacora(attemptId, journalId);
        bitacoraRepository.delete(bitacora);
        audit(accessService.actor(principal), "JOURNAL_DELETED", "Bitacora eliminada: " + journalId, ip);
    }

    private Bitacora buscarBitacora(Long attemptId, Long journalId) {
        Bitacora bitacora = bitacoraRepository.findById(journalId)
                .orElseThrow(() -> new ResourceNotFoundException("Bitacora no encontrada"));
        if (!bitacora.getIntento().getId().equals(attemptId)) {
            throw new AccessDeniedException("La bitacora no pertenece al intento indicado");
        }
        return bitacora;
    }

    private void audit(Usuario actor, String accion, String descripcion, String ip) {
        auditService.registrar(actor, accion, MODULE, descripcion, ip);
    }
}
