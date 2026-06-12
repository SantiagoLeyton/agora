package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.Pregunta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PreguntaRepository extends JpaRepository<Pregunta, Long> {

    List<Pregunta> findByEscenaIdOrderByIdAsc(Long escenaId);

    @Query("""
            SELECT p FROM Pregunta p
            JOIN p.escena e
            WHERE e.caso.id = :casoId
            AND p.activo = true
            AND p.pesoPuntos IS NOT NULL
            AND p.pesoPuntos > 0
            """)
    List<Pregunta> findGradedByCasoId(@Param("casoId") Long casoId);
}
