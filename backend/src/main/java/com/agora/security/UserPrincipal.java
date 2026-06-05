package com.agora.security;

import com.agora.modules.user.domain.Usuario;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record UserPrincipal(
        Long id,
        String nombre,
        String apellido,
        String correo,
        String password,
        String rol,
        boolean activo) implements UserDetails {

    public static UserPrincipal from(Usuario usuario) {
        return new UserPrincipal(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getPasswordHash(),
                usuario.getRol().getNombre(),
                usuario.isActivo());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol));
    }

    @Override
    public String getUsername() {
        return correo;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
