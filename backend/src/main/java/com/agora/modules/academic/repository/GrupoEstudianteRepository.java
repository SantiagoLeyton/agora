package com.agora.modules.academic.repository;

import com.agora.modules.academic.domain.GrupoEstudiante;
import com.agora.modules.academic.domain.GrupoEstudianteId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoEstudianteRepository extends JpaRepository<GrupoEstudiante, GrupoEstudianteId> {

    boolean existsByGrupoIdAndEstudianteId(Long grupoId, Long estudianteId);

    List<GrupoEstudiante> findByGrupoIdOrderByFechaIngresoAsc(Long grupoId);
}
