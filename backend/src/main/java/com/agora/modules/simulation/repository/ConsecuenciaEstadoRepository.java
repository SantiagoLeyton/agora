package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.ConsecuenciaEstado;
import com.agora.modules.simulation.domain.ConsecuenciaEstadoId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsecuenciaEstadoRepository extends JpaRepository<ConsecuenciaEstado, ConsecuenciaEstadoId> {

    List<ConsecuenciaEstado> findByConsecuenciaId(Long consecuenciaId);
}
