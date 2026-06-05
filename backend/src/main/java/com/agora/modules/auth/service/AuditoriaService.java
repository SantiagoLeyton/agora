package com.agora.modules.auth.service;

import com.agora.modules.auth.domain.Auditoria;
import com.agora.modules.auth.repository.AuditoriaRepository;
import com.agora.modules.user.domain.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private static final String AUTH_MODULE = "AUTH";

    private final AuditoriaRepository auditoriaRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(Usuario usuario, String accion, String descripcion, String ip) {
        auditoriaRepository.save(new Auditoria(usuario, accion, AUTH_MODULE, descripcion, ip));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(Usuario usuario, String accion, String modulo, String descripcion, String ip) {
        auditoriaRepository.save(new Auditoria(usuario, accion, modulo, descripcion, ip));
    }
}
