package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.EstadoIntento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoIntentoRepository extends JpaRepository<EstadoIntento, Long> {

    List<EstadoIntento> findByIntentoIdOrderByEstadoEmocionalNombreAsc(Long intentoId);

    Optional<EstadoIntento> findByIntentoIdAndEstadoEmocionalId(Long intentoId, Long estadoEmocionalId);
}
