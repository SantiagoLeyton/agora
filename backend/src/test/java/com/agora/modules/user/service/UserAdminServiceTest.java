package com.agora.modules.user.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.infrastructure.security.RefreshTokenRevocationService;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.dto.ChangePasswordRequest;
import com.agora.modules.user.dto.CreateUserRequest;
import com.agora.modules.user.repository.RolRepository;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.shared.exception.ConflictException;
import com.agora.shared.exception.ResourceNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UserAdminServiceTest {

    @Mock UsuarioRepository usuarioRepository;
    @Mock RolRepository rolRepository;
    @Mock RefreshTokenRevocationService refreshTokenRevocationService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock OperationalAuditService operationalAuditService;

    @Test
    void rejectsDuplicateEmailOnCreate() {
        UserAdminService service = service();
        CreateUserRequest request = new CreateUserRequest("Ada", "Lovelace", "ada@agora.com",
                "Agora12345*", "ESTUDIANTE");
        when(usuarioRepository.existsByCorreoIgnoreCase("ada@agora.com")).thenReturn(true);

        assertThatThrownBy(() -> service.crear(request, 1L, "127.0.0.1"))
                .isInstanceOf(ConflictException.class)
                .hasMessage("El correo ya esta registrado");
    }

    @Test
    void rejectsMissingRoleOnCreate() {
        UserAdminService service = service();
        CreateUserRequest request = new CreateUserRequest("Ada", "Lovelace", "ada@agora.com",
                "Agora12345*", "NO_EXISTE");
        when(usuarioRepository.existsByCorreoIgnoreCase("ada@agora.com")).thenReturn(false);
        when(rolRepository.findByNombre("NO_EXISTE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crear(request, 1L, "127.0.0.1"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Rol no encontrado");
    }

    @Test
    void revokesRefreshTokensWhenPasswordChanges() {
        UserAdminService service = service();
        Rol adminRole = new Rol("ADMINISTRADOR", "");
        Usuario target = new Usuario(adminRole, "Ada", "Lovelace", "ada@agora.com", "old");
        Usuario actor = new Usuario(adminRole, "Admin", "Agora", "admin@agora.com", "hash");
        ReflectionTestUtils.setField(target, "id", 10L);
        ReflectionTestUtils.setField(actor, "id", 1L);
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(target));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(actor));
        when(passwordEncoder.encode("NewAgora12345*")).thenReturn("encoded");

        service.cambiarPassword(10L, new ChangePasswordRequest("NewAgora12345*"), 1L, "127.0.0.1");

        verify(refreshTokenRevocationService).revocarActivosPorUsuario(10L);
        verify(operationalAuditService).registrar(actor, "USER_PASSWORD_CHANGED", "USER",
                "Password cambiado para usuario: ada@agora.com", "127.0.0.1");
    }

    private UserAdminService service() {
        return new UserAdminService(usuarioRepository, rolRepository, refreshTokenRevocationService, passwordEncoder,
                operationalAuditService);
    }
}
