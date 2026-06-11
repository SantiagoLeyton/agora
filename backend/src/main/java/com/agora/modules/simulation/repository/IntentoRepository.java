package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.Intento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IntentoRepository extends JpaRepository<Intento, Long> {

    Page<Intento> findByEstudianteId(Long estudianteId, Pageable pageable);

    Page<Intento> findByProgramacionDocenteId(Long docenteId, Pageable pageable);
}
