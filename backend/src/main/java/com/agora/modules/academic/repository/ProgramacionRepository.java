package com.agora.modules.academic.repository;

import com.agora.modules.academic.domain.Programacion;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProgramacionRepository extends JpaRepository<Programacion, Long>, JpaSpecificationExecutor<Programacion> {

    @Query("""
            SELECT p FROM Programacion p
            JOIN p.grupo g
            WHERE p.activo = true
            AND p.fechaFin >= :now
            AND g.docente.id = :docenteId
            AND (:periodo IS NULL OR g.periodo = :periodo)
            AND (:grupoId IS NULL OR g.id = :grupoId)
            """)
    List<Programacion> findActiveForMetricsByDocente(
            @Param("docenteId") Long docenteId,
            @Param("periodo") String periodo,
            @Param("grupoId") Long grupoId,
            @Param("now") Instant now);

    @Query("""
            SELECT p FROM Programacion p
            JOIN p.grupo g
            WHERE p.activo = true
            AND p.fechaFin >= :now
            AND (:periodo IS NULL OR g.periodo = :periodo)
            AND (:grupoId IS NULL OR g.id = :grupoId)
            """)
    List<Programacion> findActiveForMetricsAdmin(
            @Param("periodo") String periodo,
            @Param("grupoId") Long grupoId,
            @Param("now") Instant now);

    @Query("""
            SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
            FROM Programacion p
            JOIN p.grupo g
            JOIN g.estudiantes ge
            WHERE p.casoId = :casoId
            AND ge.estudiante.id = :estudianteId
            AND (p.estudiante IS NULL OR p.estudiante.id = :estudianteId)
            """)
    boolean existsVisibleForStudent(@Param("casoId") Long casoId, @Param("estudianteId") Long estudianteId);

    @Query("""
            SELECT p.id FROM Programacion p
            JOIN p.grupo g
            JOIN g.estudiantes ge
            WHERE p.casoId = :casoId
            AND p.activo = true
            AND ge.estudiante.id = :estudianteId
            AND p.fechaInicio <= :now
            AND p.fechaFin >= :now
            AND (p.estudiante IS NULL OR p.estudiante.id = :estudianteId)
            ORDER BY p.id DESC
            LIMIT 1
            """)
    java.util.Optional<Long> findActivePresentationId(
            @Param("casoId") Long casoId,
            @Param("estudianteId") Long estudianteId,
            @Param("now") Instant now);
}
