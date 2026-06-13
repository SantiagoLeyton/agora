package com.agora.modules.simulation.service;

import com.agora.modules.simulation.domain.Consecuencia;
import com.agora.modules.simulation.domain.ConsecuenciaEstado;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Respuesta;
import com.agora.modules.simulation.dto.AttemptConsequenceListResponse;
import com.agora.modules.simulation.dto.AttemptConsequenceResponse;
import com.agora.modules.simulation.dto.ConsequenceDetailResponse;
import com.agora.modules.simulation.dto.ConsequenceImpactResponse;
import com.agora.modules.simulation.repository.ConsecuenciaEstadoRepository;
import com.agora.modules.simulation.repository.ConsecuenciaRepository;
import com.agora.modules.simulation.repository.EstadoIntentoRepository;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.security.UserPrincipal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConsequenceQueryService {

    private final AttemptAccessService accessService;
    private final RespuestaRepository respuestaRepository;
    private final ConsecuenciaRepository consecuenciaRepository;
    private final ConsecuenciaEstadoRepository consecuenciaEstadoRepository;
    private final EstadoIntentoRepository estadoIntentoRepository;

    @Transactional(readOnly = true)
    public AttemptConsequenceListResponse listarPorIntento(Long attemptId, UserPrincipal principal) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        List<AttemptConsequenceResponse> consecuencias = respuestaRepository
                .findByIntentoIdOrderByFechaRespuestaAsc(attemptId).stream()
                .map(this::mapRespuesta)
                .flatMap(Optional::stream)
                .toList();
        return new AttemptConsequenceListResponse(attemptId, consecuencias);
    }

    ConsequenceDetailResponse construirDetalle(Consecuencia consecuencia, Long intentoId, boolean incluirValoresActuales) {
        List<ConsecuenciaEstado> variaciones = consecuenciaEstadoRepository.findByConsecuenciaId(consecuencia.getId());
        List<ConsequenceImpactResponse> impactos = new ArrayList<>();
        for (ConsecuenciaEstado variacion : variaciones) {
            Integer valorActual = incluirValoresActuales
                    ? estadoIntentoRepository
                            .findByIntentoIdAndEstadoEmocionalId(intentoId,
                                    variacion.getEstadoEmocional().getId())
                            .map(estado -> estado.getValorActual())
                            .orElse(variacion.getEstadoEmocional().getValorInicial())
                    : null;
            Integer valorAnterior = valorActual != null
                    ? Math.max(
                            variacion.getEstadoEmocional().getValorMinimo(),
                            Math.min(
                                    variacion.getEstadoEmocional().getValorMaximo(),
                                    valorActual - variacion.getVariacion()))
                    : null;
            impactos.add(new ConsequenceImpactResponse(
                    variacion.getEstadoEmocional().getNombre(),
                    variacion.getVariacion(),
                    valorAnterior,
                    valorActual));
        }
        return new ConsequenceDetailResponse(
                consecuencia.getId(),
                consecuencia.getMensaje(),
                consecuencia.getDescripcion(),
                consecuencia.getObservacionPedagogica(),
                impactos);
    }

    List<ConsequenceImpactResponse> aplicarYConstruirImpactos(
            Intento intento, Consecuencia consecuencia) {
        List<ConsecuenciaEstado> variaciones = consecuenciaEstadoRepository.findByConsecuenciaId(consecuencia.getId());
        List<ConsequenceImpactResponse> impactos = new ArrayList<>();
        for (ConsecuenciaEstado variacion : variaciones) {
            var estadoIntento = estadoIntentoRepository
                    .findByIntentoIdAndEstadoEmocionalId(intento.getId(), variacion.getEstadoEmocional().getId())
                    .orElseGet(() -> estadoIntentoRepository.save(
                            new com.agora.modules.simulation.domain.EstadoIntento(intento,
                                    variacion.getEstadoEmocional(),
                                    variacion.getEstadoEmocional().getValorInicial())));
            int valorAnterior = estadoIntento.getValorActual();
            estadoIntento.aplicarVariacion(variacion.getVariacion());
            estadoIntentoRepository.save(estadoIntento);
            impactos.add(new ConsequenceImpactResponse(
                    variacion.getEstadoEmocional().getNombre(),
                    variacion.getVariacion(),
                    valorAnterior,
                    estadoIntento.getValorActual()));
        }
        return impactos;
    }

    private Optional<AttemptConsequenceResponse> mapRespuesta(Respuesta respuesta) {
        return consecuenciaRepository.findByOpcionId(respuesta.getOpcion().getId()).map(consecuencia -> {
            ConsequenceDetailResponse detalle = construirDetalle(consecuencia, respuesta.getIntento().getId(), true);
            return new AttemptConsequenceResponse(
                    respuesta.getId(),
                    respuesta.getPregunta().getId(),
                    respuesta.getPregunta().getEnunciado(),
                    respuesta.getOpcion().getId(),
                    respuesta.getOpcion().getTexto(),
                    detalle.mensaje(),
                    detalle.descripcion(),
                    detalle.observacionPedagogica(),
                    detalle.impactos(),
                    respuesta.getFechaRespuesta());
        });
    }
}
