package com.agora.modules.simulation.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.academic.repository.GrupoEstudianteRepository;
import com.agora.modules.academic.repository.ProgramacionRepository;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.Escena;
import com.agora.modules.case_management.domain.Opcion;
import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.dto.CaseResponse;
import com.agora.modules.case_management.dto.SceneResponse;
import com.agora.modules.case_management.repository.CasoRepository;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.OpcionRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.modules.simulation.domain.Consecuencia;
import com.agora.modules.simulation.domain.ConsecuenciaEstado;
import com.agora.modules.simulation.domain.EstadoEmocional;
import com.agora.modules.simulation.domain.EstadoIntento;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Respuesta;
import com.agora.modules.simulation.domain.SimulationStatus;
import com.agora.modules.simulation.dto.AnswerResponse;
import com.agora.modules.simulation.dto.ConsequenceDetailResponse;
import com.agora.modules.simulation.dto.ConsequenceImpactResponse;
import com.agora.modules.simulation.dto.AnswerSimulationRequest;
import com.agora.modules.simulation.dto.AttemptResponse;
import com.agora.modules.simulation.dto.SimulationResponse;
import com.agora.modules.simulation.dto.SimulationStartedResponse;
import com.agora.modules.simulation.dto.SimulationStateResponse;
import com.agora.modules.simulation.dto.StartSimulationRequest;
import com.agora.modules.simulation.repository.ConsecuenciaEstadoRepository;
import com.agora.modules.simulation.repository.ConsecuenciaRepository;
import com.agora.modules.simulation.repository.EstadoEmocionalRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ConflictException;
import com.agora.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private static final String MODULE = "SIMULATION";

    private final IntentoRepository intentoRepository;
    private final RespuestaRepository respuestaRepository;
    private final EstadoEmocionalRepository estadoEmocionalRepository;
    private final EstadoIntentoRepository estadoIntentoRepository;
    private final ConsecuenciaRepository consecuenciaRepository;
    private final ConsecuenciaEstadoRepository consecuenciaEstadoRepository;
    private final CasoRepository casoRepository;
    private final EscenaRepository escenaRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRepository opcionRepository;
    private final ProgramacionRepository programacionRepository;
    private final GrupoEstudianteRepository grupoEstudianteRepository;
    private final UsuarioRepository usuarioRepository;
    private final OperationalAuditService auditService;
    private final AttemptFeedbackService feedbackService;
    private final AttemptGradingService attemptGradingService;
    private final ConsequenceQueryService consequenceQueryService;

    @Transactional
    public SimulationStartedResponse iniciar(StartSimulationRequest request, UserPrincipal principal, String ip) {
        Usuario estudiante = actor(principal);
        validarRolEstudiante(estudiante);
        Caso caso = casoRepository.findById(request.casoId())
                .orElseThrow(() -> new ResourceNotFoundException("Caso no encontrado"));
        if (!caso.isActivo()) {
            throw new AccessDeniedException("El caso no esta activo");
        }
        Programacion programacion = buscarProgramacion(request.programacionId(), caso.getId(), estudiante.getId());
        Intento intento = intentoRepository.save(new Intento(estudiante, caso, programacion));
        crearEstadosIniciales(intento);
        audit(estudiante, "SIMULATION_STARTED", "Simulacion iniciada: intento " + intento.getId(), ip);
        return new SimulationStartedResponse(intento.getId());
    }

    @Transactional(readOnly = true)
    public SimulationResponse consultar(Long id, UserPrincipal principal) {
        Intento intento = buscarIntento(id);
        validarLectura(intento, principal);
        return new SimulationResponse(AttemptResponse.from(intento), CaseResponse.from(intento.getCaso()),
                escenaActual(intento).map(SceneResponse::from).orElse(null), estados(id));
    }

    @Transactional
    public AnswerResponse responder(Long id, AnswerSimulationRequest request, UserPrincipal principal, String ip) {
        Intento intento = buscarIntento(id);
        validarAccionEstudiante(intento, principal);
        if (intento.getEstado() != SimulationStatus.EN_PROCESO) {
            throw new BusinessRuleException("La simulacion no esta en proceso");
        }
        Pregunta pregunta = preguntaRepository.findById(request.preguntaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pregunta no encontrada"));
        Opcion opcion = opcionRepository.findById(request.opcionId())
                .orElseThrow(() -> new ResourceNotFoundException("Opcion no encontrada"));
        validarPreguntaYOpcion(intento, pregunta, opcion);
        if (respuestaRepository.existsByIntentoIdAndPreguntaId(intento.getId(), pregunta.getId())) {
            throw new ConflictException("La pregunta ya fue respondida en este intento");
        }

        Respuesta respuesta = respuestaRepository.save(new Respuesta(intento, pregunta, opcion));
        Optional<Consecuencia> consecuencia = consecuenciaRepository.findByOpcionId(opcion.getId());
        ConsequenceDetailResponse detalle = null;
        String mensaje = null;
        if (consecuencia.isPresent()) {
            Consecuencia value = consecuencia.get();
            mensaje = value.getMensaje();
            List<ConsequenceImpactResponse> impactos =
                    consequenceQueryService.aplicarYConstruirImpactos(intento, value);
            detalle = new ConsequenceDetailResponse(
                    value.getId(),
                    value.getMensaje(),
                    value.getDescripcion(),
                    value.getObservacionPedagogica(),
                    impactos);
            audit(actor(principal), "STATE_UPDATED",
                    "Consecuencia aplicada para opcion: " + opcion.getId(), ip);
        }
        audit(actor(principal), "ANSWER_SUBMITTED", "Respuesta registrada: " + respuesta.getId(), ip);
        return new AnswerResponse(respuesta.getId(), intento.getId(), pregunta.getId(), opcion.getId(), mensaje,
                detalle, estados(intento.getId()));
    }

    @Transactional(readOnly = true)
    public List<SimulationStateResponse> consultarEstados(Long id, UserPrincipal principal) {
        Intento intento = buscarIntento(id);
        validarLectura(intento, principal);
        return estados(id);
    }

    @Transactional
    public SimulationResponse finalizar(Long id, UserPrincipal principal, String ip) {
        Intento intento = buscarIntento(id);
        validarAccionEstudiante(intento, principal);
        if (intento.getEstado() != SimulationStatus.EN_PROCESO) {
            throw new BusinessRuleException("La simulacion no esta en proceso");
        }
        intento.finalizar();
        attemptGradingService.calcularYRegistrar(intento);
        Intento guardado = intentoRepository.save(intento);
        Usuario actor = actor(principal);
        feedbackService.generarSistema(guardado, actor, ip);
        audit(actor, "SIMULATION_FINISHED", "Simulacion finalizada: intento " + id, ip);
        return new SimulationResponse(AttemptResponse.from(guardado), CaseResponse.from(guardado.getCaso()), null,
                estados(id));
    }

    @Transactional
    public SimulationResponse abandonar(Long id, UserPrincipal principal, String ip) {
        Intento intento = buscarIntento(id);
        validarAccionEstudiante(intento, principal);
        if (intento.getEstado() != SimulationStatus.EN_PROCESO) {
            throw new BusinessRuleException("La simulacion no esta en proceso");
        }
        intento.abandonar();
        Intento guardado = intentoRepository.save(intento);
        audit(actor(principal), "SIMULATION_ABANDONED", "Simulacion abandonada: intento " + id, ip);
        return new SimulationResponse(AttemptResponse.from(guardado), CaseResponse.from(guardado.getCaso()), null,
                estados(id));
    }

    private void crearEstadosIniciales(Intento intento) {
        List<EstadoEmocional> estados = estadoEmocionalRepository.findAll();
        for (EstadoEmocional estado : estados) {
            estadoIntentoRepository.save(new EstadoIntento(intento, estado, estado.getValorInicial()));
        }
    }

    private Optional<Escena> escenaActual(Intento intento) {
        List<Escena> escenas = escenaRepository.findByCasoIdOrderByOrdenAsc(intento.getCaso().getId()).stream()
                .filter(Escena::isActivo)
                .toList();
        Set<Long> respondidas = respuestaRepository.findByIntentoId(intento.getId()).stream()
                .map(respuesta -> respuesta.getPregunta().getId())
                .collect(Collectors.toSet());
        for (Escena escena : escenas) {
            boolean tienePendiente = preguntaRepository.findByEscenaIdOrderByIdAsc(escena.getId()).stream()
                    .filter(Pregunta::isActivo)
                    .anyMatch(pregunta -> !respondidas.contains(pregunta.getId()));
            if (tienePendiente) {
                return Optional.of(escena);
            }
        }
        if (respondidas.isEmpty() && !escenas.isEmpty()) {
            return Optional.of(escenas.get(0));
        }
        return Optional.empty();
    }

    private List<SimulationStateResponse> estados(Long intentoId) {
        return estadoIntentoRepository.findByIntentoIdOrderByEstadoEmocionalNombreAsc(intentoId).stream()
                .map(SimulationStateResponse::from)
                .toList();
    }

    private Programacion buscarProgramacion(Long programacionId, Long casoId, Long estudianteId) {
        if (programacionId == null) {
            return null;
        }
        Programacion programacion = programacionRepository.findById(programacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Programacion no encontrada"));
        if (!programacion.isActivo()) {
            throw new BusinessRuleException("La programacion no esta activa");
        }
        Grupo grupo = programacion.getGrupo();
        if (!grupo.isActivo()) {
            throw new BusinessRuleException("El grupo de la programacion no esta activo");
        }
        if (!grupoEstudianteRepository.existsByGrupoIdAndEstudianteId(grupo.getId(), estudianteId)) {
            throw new AccessDeniedException("No esta matriculado en el grupo de esta programacion");
        }
        Instant now = Instant.now();
        if (now.isBefore(programacion.getFechaInicio())) {
            throw new BusinessRuleException("La programacion aun no esta disponible");
        }
        if (now.isAfter(programacion.getFechaFin())) {
            throw new BusinessRuleException("La programacion ya finalizo");
        }
        if (programacion.getCasoId() == null) {
            throw new BusinessRuleException("La programacion no tiene un caso asignado");
        }
        if (!programacion.getCasoId().equals(casoId)) {
            throw new BusinessRuleException("La programacion no corresponde al caso indicado");
        }
        if (programacion.getEstudiante() != null
                && !programacion.getEstudiante().getId().equals(estudianteId)) {
            throw new AccessDeniedException("La programacion no esta asignada a este estudiante");
        }
        return programacion;
    }

    private void validarPreguntaYOpcion(Intento intento, Pregunta pregunta, Opcion opcion) {
        if (!pregunta.isActivo()) {
            throw new BusinessRuleException("La pregunta no esta activa");
        }
        if (!opcion.isActivo()) {
            throw new BusinessRuleException("La opcion no esta activa");
        }
        if (!pregunta.getEscena().getCaso().getId().equals(intento.getCaso().getId())) {
            throw new BusinessRuleException("La pregunta no pertenece al caso del intento");
        }
        if (!opcion.getPregunta().getId().equals(pregunta.getId())) {
            throw new BusinessRuleException("La opcion no pertenece a la pregunta indicada");
        }
    }

    private Intento buscarIntento(Long id) {
        return intentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intento no encontrado"));
    }

    private void validarLectura(Intento intento, UserPrincipal principal) {
        if ("ADMINISTRADOR".equals(principal.rol())) {
            return;
        }
        if ("ESTUDIANTE".equals(principal.rol()) && intento.getEstudiante().getId().equals(principal.id())) {
            return;
        }
        if ("DOCENTE".equals(principal.rol()) && intento.getProgramacion() != null
                && intento.getProgramacion().getDocente().getId().equals(principal.id())) {
            return;
        }
        throw new AccessDeniedException("No tiene permiso para consultar este intento");
    }

    private void validarAccionEstudiante(Intento intento, UserPrincipal principal) {
        if (!"ESTUDIANTE".equals(principal.rol())) {
            throw new AccessDeniedException("Solo el estudiante puede modificar su simulacion");
        }
        if (!intento.getEstudiante().getId().equals(principal.id())) {
            throw new AccessDeniedException("No puede modificar un intento de otro estudiante");
        }
    }

    private void validarRolEstudiante(Usuario usuario) {
        if (!"ESTUDIANTE".equals(usuario.getRol().getNombre())) {
            throw new AccessDeniedException("Solo estudiantes pueden iniciar simulaciones");
        }
    }

    private Usuario actor(UserPrincipal principal) {
        return usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
    }

    private void audit(Usuario actor, String accion, String descripcion, String ip) {
        auditService.registrar(actor, accion, MODULE, descripcion, ip);
    }
}
