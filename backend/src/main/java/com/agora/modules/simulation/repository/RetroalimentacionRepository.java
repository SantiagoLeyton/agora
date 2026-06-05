package com.agora.modules.simulation.repository;

import com.agora.modules.simulation.domain.FeedbackAuthor;
import com.agora.modules.simulation.domain.Retroalimentacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RetroalimentacionRepository extends JpaRepository<Retroalimentacion, Long> {

    List<Retroalimentacion> findByIntentoIdOrderByFechaGeneracionAsc(Long intentoId);

    boolean existsByIntentoIdAndAutor(Long intentoId, FeedbackAuthor autor);
}
