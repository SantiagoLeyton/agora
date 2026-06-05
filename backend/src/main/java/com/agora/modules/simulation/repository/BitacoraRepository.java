package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.Bitacora;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BitacoraRepository extends JpaRepository<Bitacora, Long> {

    List<Bitacora> findByIntentoIdOrderByFechaRegistroAsc(Long intentoId);
}
