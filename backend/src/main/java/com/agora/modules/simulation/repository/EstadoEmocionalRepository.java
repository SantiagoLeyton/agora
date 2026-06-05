package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.EstadoEmocional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoEmocionalRepository extends JpaRepository<EstadoEmocional, Long> {
}
