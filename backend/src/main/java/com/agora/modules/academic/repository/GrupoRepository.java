package com.agora.modules.academic.repository;

import com.agora.modules.academic.domain.Grupo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface GrupoRepository extends JpaRepository<Grupo, Long>, JpaSpecificationExecutor<Grupo> {

    Optional<Grupo> findByClaveAccesoIgnoreCase(String claveAcceso);

    boolean existsByClaveAccesoIgnoreCaseAndIdNot(String claveAcceso, Long id);
}
