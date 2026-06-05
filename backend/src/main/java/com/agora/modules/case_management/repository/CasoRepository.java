package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.Caso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface CasoRepository extends JpaRepository<Caso, Long>, JpaSpecificationExecutor<Caso> {

    @EntityGraph(attributePaths = {"herramientas", "entidades"})
    Optional<Caso> findWithHerramientasAndEntidadesById(Long id);
}
