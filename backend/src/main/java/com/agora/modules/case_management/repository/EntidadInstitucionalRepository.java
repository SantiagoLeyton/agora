package com.agora.modules.case_management.repository;

import com.agora.modules.case_management.domain.EntidadInstitucional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EntidadInstitucionalRepository extends JpaRepository<EntidadInstitucional, Long>,
        JpaSpecificationExecutor<EntidadInstitucional> {
}
