package com.agora.modules.simulation.service;

import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Respuesta;
import com.agora.modules.simulation.repository.RespuestaRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AttemptGradingService {

    private static final BigDecimal SCALE_FIVE = BigDecimal.valueOf(5);

    private final PreguntaRepository preguntaRepository;
    private final RespuestaRepository respuestaRepository;

    public void calcularYRegistrar(Intento intento) {
        List<Pregunta> preguntas = preguntaRepository.findGradedByCasoId(intento.getCaso().getId());
        if (preguntas.isEmpty()) {
            return;
        }

        BigDecimal puntosMaximos = preguntas.stream()
                .map(Pregunta::getPesoPuntos)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (puntosMaximos.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        Map<Long, Respuesta> respuestasPorPregunta = respuestaRepository.findByIntentoId(intento.getId()).stream()
                .collect(Collectors.toMap(respuesta -> respuesta.getPregunta().getId(), Function.identity(),
                        (left, right) -> left));

        BigDecimal puntosObtenidos = BigDecimal.ZERO;
        for (Pregunta pregunta : preguntas) {
            Respuesta respuesta = respuestasPorPregunta.get(pregunta.getId());
            if (respuesta == null) {
                continue;
            }
            BigDecimal credito = respuesta.getOpcion().getPorcentajeCredito();
            if (credito == null) {
                continue;
            }
            BigDecimal fraccion = credito.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
            puntosObtenidos = puntosObtenidos.add(pregunta.getPesoPuntos().multiply(fraccion));
        }

        BigDecimal notaFinal = puntosObtenidos
                .multiply(SCALE_FIVE)
                .divide(puntosMaximos, 2, RoundingMode.HALF_UP);

        intento.registrarCalificacion(
                puntosObtenidos.setScale(2, RoundingMode.HALF_UP),
                puntosMaximos.setScale(2, RoundingMode.HALF_UP),
                notaFinal);
    }
}
