package com.agora.modules.simulation.service;

import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.domain.ResultadoAprendizaje;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.modules.case_management.repository.ResultadoAprendizajeRepository;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Respuesta;
import com.agora.modules.simulation.dto.RdaAttemptEvaluationResponse;
import com.agora.modules.simulation.dto.RdaComplianceStatus;
import com.agora.modules.simulation.dto.RdaEvaluationItemResponse;
import com.agora.modules.simulation.repository.RespuestaRepository;
import com.agora.security.UserPrincipal;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RdaEvaluationService {

    private static final BigDecimal SCALE_FIVE = BigDecimal.valueOf(5);
    private static final BigDecimal CUMPLIDO_THRESHOLD = BigDecimal.valueOf(70);
    private static final BigDecimal PARCIAL_THRESHOLD = BigDecimal.valueOf(40);

    private final AttemptAccessService accessService;
    private final ResultadoAprendizajeRepository resultadoRepository;
    private final PreguntaRepository preguntaRepository;
    private final RespuestaRepository respuestaRepository;

    @Transactional(readOnly = true)
    public RdaAttemptEvaluationResponse evaluarIntento(Long attemptId, UserPrincipal principal) {
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        return new RdaAttemptEvaluationResponse(attemptId, intento.getCaso().getId(),
                evaluarCaso(intento.getCaso().getId(), attemptId));
    }

    @Transactional(readOnly = true)
    public List<RdaEvaluationItemResponse> evaluarCaso(Long casoId, Long attemptId) {
        List<ResultadoAprendizaje> resultados = resultadoRepository.findByCasoIdOrderByOrdenAsc(casoId);
        if (resultados.isEmpty()) {
            return List.of();
        }

        List<Pregunta> preguntasGraduadas = preguntaRepository.findGradedByCasoId(casoId);
        Map<Long, List<Pregunta>> preguntasPorRda = preguntasGraduadas.stream()
                .filter(pregunta -> pregunta.getResultadoAprendizaje() != null)
                .collect(Collectors.groupingBy(pregunta -> pregunta.getResultadoAprendizaje().getId()));

        Map<Long, Respuesta> respuestasPorPregunta = respuestaRepository.findByIntentoId(attemptId).stream()
                .collect(Collectors.toMap(respuesta -> respuesta.getPregunta().getId(), Function.identity(),
                        (left, right) -> left));

        List<RdaEvaluationItemResponse> items = new ArrayList<>();
        for (ResultadoAprendizaje resultado : resultados) {
            items.add(evaluarResultado(resultado, preguntasPorRda.getOrDefault(resultado.getId(), List.of()),
                    respuestasPorPregunta));
        }
        return items;
    }

    private RdaEvaluationItemResponse evaluarResultado(
            ResultadoAprendizaje resultado,
            List<Pregunta> preguntas,
            Map<Long, Respuesta> respuestasPorPregunta) {
        if (preguntas.isEmpty()) {
            return new RdaEvaluationItemResponse(resultado.getId(), resultado.getOrden(), resultado.getDescripcion(),
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, RdaComplianceStatus.NO_EVIDENCIADO,
                    0, 0);
        }

        BigDecimal puntosMaximos = preguntas.stream()
                .map(Pregunta::getPesoPuntos)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal puntosObtenidos = BigDecimal.ZERO;
        int preguntasEvaluadas = 0;
        for (Pregunta pregunta : preguntas) {
            Respuesta respuesta = respuestasPorPregunta.get(pregunta.getId());
            if (respuesta == null) {
                continue;
            }
            preguntasEvaluadas += 1;
            BigDecimal credito = respuesta.getOpcion().getPorcentajeCredito();
            if (credito == null) {
                continue;
            }
            BigDecimal fraccion = credito.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            puntosObtenidos = puntosObtenidos.add(pregunta.getPesoPuntos().multiply(fraccion));
        }

        if (preguntasEvaluadas == 0 || puntosMaximos.compareTo(BigDecimal.ZERO) <= 0) {
            return new RdaEvaluationItemResponse(resultado.getId(), resultado.getOrden(), resultado.getDescripcion(),
                    puntosObtenidos.setScale(2, RoundingMode.HALF_UP),
                    puntosMaximos.setScale(2, RoundingMode.HALF_UP), BigDecimal.ZERO, BigDecimal.ZERO,
                    RdaComplianceStatus.NO_EVIDENCIADO, preguntasEvaluadas, preguntas.size());
        }

        BigDecimal compliancePct = puntosObtenidos
                .multiply(BigDecimal.valueOf(100))
                .divide(puntosMaximos, 2, RoundingMode.HALF_UP);
        BigDecimal nota = puntosObtenidos.multiply(SCALE_FIVE).divide(puntosMaximos, 2, RoundingMode.HALF_UP);

        return new RdaEvaluationItemResponse(resultado.getId(), resultado.getOrden(), resultado.getDescripcion(),
                puntosObtenidos.setScale(2, RoundingMode.HALF_UP), puntosMaximos.setScale(2, RoundingMode.HALF_UP),
                compliancePct, nota, mapEstado(compliancePct), preguntasEvaluadas, preguntas.size());
    }

    private RdaComplianceStatus mapEstado(BigDecimal compliancePct) {
        if (compliancePct.compareTo(CUMPLIDO_THRESHOLD) >= 0) {
            return RdaComplianceStatus.CUMPLIDO;
        }
        if (compliancePct.compareTo(PARCIAL_THRESHOLD) >= 0) {
            return RdaComplianceStatus.PARCIALMENTE_CUMPLIDO;
        }
        return RdaComplianceStatus.NO_EVIDENCIADO;
    }
}
