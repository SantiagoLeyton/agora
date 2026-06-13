package com.agora.modules.academic.repository;

import com.agora.modules.academic.domain.GrupoDocente;
import com.agora.modules.academic.domain.GrupoDocenteId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GrupoDocenteRepository extends JpaRepository<GrupoDocente, GrupoDocenteId> {

    List<GrupoDocente> findByGrupoIdOrderByFechaAsignacionAsc(Long grupoId);

    long countByGrupoId(Long grupoId);

    boolean existsByGrupoIdAndDocenteId(Long grupoId, Long docenteId);
}
