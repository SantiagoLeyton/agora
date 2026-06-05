package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.Escena;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscenaRepository extends JpaRepository<Escena, Long> {

    boolean existsByCasoIdAndOrden(Long casoId, Integer orden);

    boolean existsByCasoIdAndOrdenAndIdNot(Long casoId, Integer orden, Long id);

    List<Escena> findByCasoIdOrderByOrdenAsc(Long casoId);
}
