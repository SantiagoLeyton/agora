package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.Herramienta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface HerramientaRepository extends JpaRepository<Herramienta, Long>, JpaSpecificationExecutor<Herramienta> {
}
