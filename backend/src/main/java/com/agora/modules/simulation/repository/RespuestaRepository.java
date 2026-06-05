package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.Respuesta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RespuestaRepository extends JpaRepository<Respuesta, Long> {

    boolean existsByIntentoIdAndPreguntaId(Long intentoId, Long preguntaId);

    List<Respuesta> findByIntentoId(Long intentoId);

    List<Respuesta> findByIntentoIdOrderByFechaRespuestaAsc(Long intentoId);
}
