package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.Intento;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IntentoRepository extends JpaRepository<Intento, Long> {

    Page<Intento> findByEstudianteId(Long estudianteId, Pageable pageable);

    Page<Intento> findByProgramacionDocenteId(Long docenteId, Pageable pageable);

    @Query("""
            SELECT i FROM Intento i
            JOIN FETCH i.programacion p
            JOIN FETCH p.grupo g
            JOIN FETCH i.caso c
            JOIN FETCH i.estudiante e
            WHERE i.programacion IS NOT NULL
            AND g.docente.id = :docenteId
            AND (:periodo IS NULL OR g.periodo = :periodo)
            AND (:grupoId IS NULL OR g.id = :grupoId)
            """)
    List<Intento> findForTeacherMetricsByDocente(
            @Param("docenteId") Long docenteId,
            @Param("periodo") String periodo,
            @Param("grupoId") Long grupoId);

    @Query("""
            SELECT i FROM Intento i
            JOIN FETCH i.programacion p
            JOIN FETCH p.grupo g
            JOIN FETCH i.caso c
            JOIN FETCH i.estudiante e
            WHERE i.programacion IS NOT NULL
            AND (:periodo IS NULL OR g.periodo = :periodo)
            AND (:grupoId IS NULL OR g.id = :grupoId)
            """)
    List<Intento> findForTeacherMetricsAdmin(
            @Param("periodo") String periodo,
            @Param("grupoId") Long grupoId);

}
