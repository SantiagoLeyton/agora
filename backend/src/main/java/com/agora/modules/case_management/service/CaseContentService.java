package com.agora.modules.case_management.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.Escena;
import com.agora.modules.case_management.domain.Opcion;
import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.dto.OptionRequest;
import com.agora.modules.case_management.dto.OptionResponse;
import com.agora.modules.case_management.dto.QuestionRequest;
import com.agora.modules.case_management.dto.QuestionResponse;
import com.agora.modules.case_management.dto.SceneRequest;
import com.agora.modules.case_management.dto.SceneResponse;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.OpcionRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
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
public class CaseContentService {

    private static final String MODULE = "CASE_MANAGEMENT";

    private final CaseService caseService;
    private final EscenaRepository escenaRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRepository opcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final OperationalAuditService auditService;

    @Transactional
    public SceneResponse crearEscena(Long casoId, SceneRequest request, UserPrincipal principal, String ip) {
        if (escenaRepository.existsByCasoIdAndOrden(casoId, request.orden())) {
            throw new ConflictException("Ya existe una escena con ese orden para el caso");
        }
        Caso caso = caseService.buscarCaso(casoId);
        Escena escena = escenaRepository.save(new Escena(caso, request.orden(), request.titulo(),
                request.descripcion(), request.contenido()));
        audit(principal, "SCENE_CREATED", "Escena creada: " + escena.getId(), ip);
        return SceneResponse.from(escena);
    }

    @Transactional(readOnly = true)
    public List<SceneResponse> listarEscenas(Long casoId, UserPrincipal principal) {
        caseService.validarLectura(caseService.buscarCaso(casoId), principal);
        return escenaRepository.findByCasoIdOrderByOrdenAsc(casoId).stream().map(SceneResponse::from).toList();
    }

    @Transactional
    public SceneResponse actualizarEscena(Long id, SceneRequest request, UserPrincipal principal, String ip) {
        Escena escena = buscarEscena(id);
        Long casoId = escena.getCaso().getId();
        if (escenaRepository.existsByCasoIdAndOrdenAndIdNot(casoId, request.orden(), id)) {
            throw new ConflictException("Ya existe una escena con ese orden para el caso");
        }
        escena.actualizar(request.orden(), request.titulo(), request.descripcion(), request.contenido(),
                request.activo() == null || request.activo());
        audit(principal, "SCENE_UPDATED", "Escena actualizada: " + id, ip);
        return SceneResponse.from(escenaRepository.save(escena));
    }

    @Transactional
    public void eliminarEscena(Long id, UserPrincipal principal, String ip) {
        escenaRepository.delete(buscarEscena(id));
        audit(principal, "SCENE_DELETED", "Escena eliminada: " + id, ip);
    }

    @Transactional
    public QuestionResponse crearPregunta(Long escenaId, QuestionRequest request, UserPrincipal principal, String ip) {
        Pregunta pregunta = preguntaRepository.save(new Pregunta(buscarEscena(escenaId), request.enunciado(),
                request.obligatoria() == null || request.obligatoria()));
        audit(principal, "QUESTION_CREATED", "Pregunta creada: " + pregunta.getId(), ip);
        return QuestionResponse.from(pregunta);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> listarPreguntas(Long escenaId) {
        return preguntaRepository.findByEscenaIdOrderByIdAsc(escenaId).stream().map(QuestionResponse::from).toList();
    }

    @Transactional
    public QuestionResponse actualizarPregunta(Long id, QuestionRequest request, UserPrincipal principal, String ip) {
        Pregunta pregunta = buscarPregunta(id);
        pregunta.actualizar(request.enunciado(), request.obligatoria() == null || request.obligatoria(),
                request.activo() == null || request.activo());
        audit(principal, "QUESTION_UPDATED", "Pregunta actualizada: " + id, ip);
        return QuestionResponse.from(preguntaRepository.save(pregunta));
    }

    @Transactional
    public void eliminarPregunta(Long id, UserPrincipal principal, String ip) {
        preguntaRepository.delete(buscarPregunta(id));
        audit(principal, "QUESTION_DELETED", "Pregunta eliminada: " + id, ip);
    }

    @Transactional
    public OptionResponse crearOpcion(Long preguntaId, OptionRequest request, UserPrincipal principal, String ip) {
        if (opcionRepository.existsByPreguntaIdAndOrden(preguntaId, request.orden())) {
            throw new ConflictException("Ya existe una opcion con ese orden para la pregunta");
        }
        Opcion opcion = opcionRepository.save(new Opcion(buscarPregunta(preguntaId), request.texto(),
                request.descripcion(), request.orden()));
        audit(principal, "OPTION_CREATED", "Opcion creada: " + opcion.getId(), ip);
        return OptionResponse.from(opcion);
    }

    @Transactional(readOnly = true)
    public List<OptionResponse> listarOpciones(Long preguntaId) {
        return opcionRepository.findByPreguntaIdOrderByOrdenAsc(preguntaId).stream().map(OptionResponse::from).toList();
    }

    @Transactional
    public OptionResponse actualizarOpcion(Long id, OptionRequest request, UserPrincipal principal, String ip) {
        Opcion opcion = buscarOpcion(id);
        if (opcionRepository.existsByPreguntaIdAndOrdenAndIdNot(opcion.getPregunta().getId(), request.orden(), id)) {
            throw new ConflictException("Ya existe una opcion con ese orden para la pregunta");
        }
        opcion.actualizar(request.texto(), request.descripcion(), request.orden(),
                request.activo() == null || request.activo());
        audit(principal, "OPTION_UPDATED", "Opcion actualizada: " + id, ip);
        return OptionResponse.from(opcionRepository.save(opcion));
    }

    @Transactional
    public void eliminarOpcion(Long id, UserPrincipal principal, String ip) {
        opcionRepository.delete(buscarOpcion(id));
        audit(principal, "OPTION_DELETED", "Opcion eliminada: " + id, ip);
    }

    Escena buscarEscena(Long id) {
        return escenaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Escena no encontrada"));
    }

    Pregunta buscarPregunta(Long id) {
        return preguntaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pregunta no encontrada"));
    }

    Opcion buscarOpcion(Long id) {
        return opcionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Opcion no encontrada"));
    }

    private void audit(UserPrincipal principal, String accion, String descripcion, String ip) {
        Usuario actor = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
        auditService.registrar(actor, accion, MODULE, descripcion, ip);
    }
}
