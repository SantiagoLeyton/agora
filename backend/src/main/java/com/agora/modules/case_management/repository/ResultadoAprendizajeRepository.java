package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.ResultadoAprendizaje;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoAprendizajeRepository extends JpaRepository<ResultadoAprendizaje, Long> {

    List<ResultadoAprendizaje> findByCasoIdOrderByOrdenAsc(Long casoId);

    boolean existsByCasoIdAndOrdenAndIdNot(Long casoId, Integer orden, Long id);

    boolean existsByCasoIdAndOrden(Long casoId, Integer orden);

    void deleteByCasoId(Long casoId);
}
