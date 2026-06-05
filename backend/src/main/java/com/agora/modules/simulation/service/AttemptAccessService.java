package com.agora.modules.simulation.service;

import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttemptAccessService {

    private final IntentoRepository intentoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public Intento buscarIntento(Long id) {
        return intentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intento no encontrado"));
    }

    @Transactional(readOnly = true)
    public Usuario actor(UserPrincipal principal) {
        return usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
    }

    public void validarLectura(Intento intento, UserPrincipal principal) {
        if ("ADMINISTRADOR".equals(principal.rol())) {
            return;
        }
        if ("ESTUDIANTE".equals(principal.rol()) && intento.getEstudiante().getId().equals(principal.id())) {
            return;
        }
        if ("DOCENTE".equals(principal.rol()) && docenteDelIntento(intento, principal.id())) {
            return;
        }
        throw new AccessDeniedException("No tiene permiso para consultar este intento");
    }

    public void validarEstudiantePropietario(Intento intento, UserPrincipal principal) {
        if (!"ESTUDIANTE".equals(principal.rol()) || !intento.getEstudiante().getId().equals(principal.id())) {
            throw new AccessDeniedException("No puede gestionar un intento de otro estudiante");
        }
    }

    public void validarFeedbackDocenteOAdmin(Intento intento, UserPrincipal principal) {
        if ("ADMINISTRADOR".equals(principal.rol())) {
            return;
        }
        if ("DOCENTE".equals(principal.rol()) && docenteDelIntento(intento, principal.id())) {
            return;
        }
        throw new AccessDeniedException("No tiene permiso para retroalimentar este intento");
    }

    private boolean docenteDelIntento(Intento intento, Long docenteId) {
        return intento.getProgramacion() != null && intento.getProgramacion().getDocente().getId().equals(docenteId);
    }
}
