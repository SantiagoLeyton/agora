package com.agora.modules.academic.repository;

import com.agora.modules.academic.domain.Programacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProgramacionRepository extends JpaRepository<Programacion, Long>, JpaSpecificationExecutor<Programacion> {
}
