package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.Caso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface CasoRepository extends JpaRepository<Caso, Long>, JpaSpecificationExecutor<Caso> {

    @EntityGraph(attributePaths = {"herramientas", "entidades"})
    Optional<Caso> findWithHerramientasAndEntidadesById(Long id);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM intento WHERE caso_id = :casoId)", nativeQuery = true)
    boolean hasAttempts(@Param("casoId") Long casoId);
}
