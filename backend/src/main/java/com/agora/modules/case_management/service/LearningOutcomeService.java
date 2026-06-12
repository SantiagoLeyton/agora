package com.agora.modules.case_management.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.ResultadoAprendizaje;
import com.agora.modules.case_management.dto.LearningOutcomeRequest;
import com.agora.modules.case_management.dto.LearningOutcomeResponse;
import com.agora.modules.case_management.repository.ResultadoAprendizajeRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.ConflictException;
import com.agora.shared.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LearningOutcomeService {

    private static final String MODULE = "CASE_MANAGEMENT";

    private final CaseService caseService;
    private final ResultadoAprendizajeRepository resultadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final OperationalAuditService auditService;

    @Transactional(readOnly = true)
    public List<LearningOutcomeResponse> listar(Long casoId, UserPrincipal principal) {
        Caso caso = caseService.buscarCaso(casoId);
        caseService.validarLectura(caso, principal);
        return resultadoRepository.findByCasoIdOrderByOrdenAsc(casoId).stream()
                .map(LearningOutcomeResponse::from)
                .toList();
    }

    @Transactional
    public LearningOutcomeResponse crear(Long casoId, LearningOutcomeRequest request, UserPrincipal principal,
            String ip) {
        if (resultadoRepository.existsByCasoIdAndOrden(casoId, request.orden())) {
            throw new ConflictException("Ya existe un resultado de aprendizaje con ese orden para el caso");
        }
        Caso caso = caseService.buscarCaso(casoId);
        ResultadoAprendizaje resultado = resultadoRepository
                .save(new ResultadoAprendizaje(caso, request.orden(), request.descripcion().trim()));
        audit(principal, "LEARNING_OUTCOME_CREATED", "RDA creado: " + resultado.getId(), ip);
        return LearningOutcomeResponse.from(resultado);
    }

    @Transactional
    public LearningOutcomeResponse actualizar(Long id, LearningOutcomeRequest request, UserPrincipal principal,
            String ip) {
        ResultadoAprendizaje resultado = buscar(id);
        Long casoId = resultado.getCaso().getId();
        if (resultadoRepository.existsByCasoIdAndOrdenAndIdNot(casoId, request.orden(), id)) {
            throw new ConflictException("Ya existe un resultado de aprendizaje con ese orden para el caso");
        }
        resultado.actualizar(request.orden(), request.descripcion().trim());
        audit(principal, "LEARNING_OUTCOME_UPDATED", "RDA actualizado: " + id, ip);
        return LearningOutcomeResponse.from(resultadoRepository.save(resultado));
    }

    @Transactional
    public void eliminar(Long id, UserPrincipal principal, String ip) {
        resultadoRepository.delete(buscar(id));
        audit(principal, "LEARNING_OUTCOME_DELETED", "RDA eliminado: " + id, ip);
    }

    @Transactional
    public List<LearningOutcomeResponse> sincronizar(Long casoId, List<LearningOutcomeRequest> requests,
            UserPrincipal principal, String ip) {
        validarSolicitud(requests);
        caseService.buscarCaso(casoId);
        resultadoRepository.deleteByCasoId(casoId);
        List<ResultadoAprendizaje> guardados = requests.stream()
                .map(request -> new ResultadoAprendizaje(caseService.buscarCaso(casoId), request.orden(),
                        request.descripcion().trim()))
                .map(resultadoRepository::save)
                .toList();
        audit(principal, "LEARNING_OUTCOMES_SYNCED", "RDA sincronizados para caso: " + casoId, ip);
        return guardados.stream().map(LearningOutcomeResponse::from).toList();
    }

    List<LearningOutcomeResponse> listarPorCaso(Long casoId) {
        return resultadoRepository.findByCasoIdOrderByOrdenAsc(casoId).stream()
                .map(LearningOutcomeResponse::from)
                .toList();
    }

    private void validarSolicitud(List<LearningOutcomeRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new ConflictException("El caso debe tener al menos un resultado de aprendizaje");
        }
        boolean empty = requests.stream().anyMatch(request -> request.descripcion() == null
                || request.descripcion().isBlank());
        if (empty) {
            throw new ConflictException("Los resultados de aprendizaje no pueden estar vacios");
        }
        long unique = requests.stream().map(request -> request.descripcion().trim().toLowerCase()).distinct().count();
        if (unique != requests.size()) {
            throw new ConflictException("Los resultados de aprendizaje no pueden duplicarse");
        }
    }

    ResultadoAprendizaje buscar(Long id) {
        return resultadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado de aprendizaje no encontrado"));
    }

    private void audit(UserPrincipal principal, String accion, String descripcion, String ip) {
        Usuario actor = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
        auditService.registrar(actor, accion, MODULE, descripcion, ip);
    }
}
