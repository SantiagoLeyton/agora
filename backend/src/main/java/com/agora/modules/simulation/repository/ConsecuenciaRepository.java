package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.Consecuencia;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsecuenciaRepository extends JpaRepository<Consecuencia, Long> {

    Optional<Consecuencia> findByOpcionId(Long opcionId);
}
