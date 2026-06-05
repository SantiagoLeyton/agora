package com.agora.modules.ai.repository;

import com.agora.modules.ai.domain.SintesisIa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SintesisIaRepository extends JpaRepository<SintesisIa, Long> {

    List<SintesisIa> findByIntentoIdOrderByFechaGeneracionDesc(Long intentoId);
}
