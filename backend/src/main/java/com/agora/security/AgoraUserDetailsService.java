package com.agora.security;

import com.agora.modules.user.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AgoraUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) {
        return usuarioRepository.findByCorreoIgnoreCase(correo)
                .map(UserPrincipal::from)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }
}

