package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.Pregunta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreguntaRepository extends JpaRepository<Pregunta, Long> {

    List<Pregunta> findByEscenaIdOrderByIdAsc(Long escenaId);
}
