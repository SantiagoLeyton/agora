package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.Opcion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpcionRepository extends JpaRepository<Opcion, Long> {

    boolean existsByPreguntaIdAndOrden(Long preguntaId, Integer orden);

    boolean existsByPreguntaIdAndOrdenAndIdNot(Long preguntaId, Integer orden, Long id);

    List<Opcion> findByPreguntaIdOrderByOrdenAsc(Long preguntaId);
}
