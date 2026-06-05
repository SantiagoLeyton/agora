package com.agora.modules.user.service;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.infrastructure.security.RefreshTokenRevocationService;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.dto.ChangePasswordRequest;
import com.agora.modules.user.dto.CreateUserRequest;
import com.agora.modules.user.dto.UpdateUserRequest;
import com.agora.modules.user.dto.UserResponse;
import com.agora.modules.user.repository.RolRepository;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.shared.exception.BusinessRuleException;
import com.agora.shared.exception.ConflictException;
import com.agora.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private static final String ADMIN_ROLE = "ADMINISTRADOR";
    private static final String USER_MODULE = "USER";

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final RefreshTokenRevocationService refreshTokenRevocationService;
    private final PasswordEncoder passwordEncoder;
    private final OperationalAuditService operationalAuditService;

    @Transactional
    public UserResponse crear(CreateUserRequest request, Long actorId, String ip) {
        validarCorreoDisponible(request.correo());
        Rol rol = buscarRol(request.rol());
        Usuario usuario = usuarioRepository.save(new Usuario(rol, request.nombre(), request.apellido(),
                request.correo(), passwordEncoder.encode(request.passwordTemporal())));
        operationalAuditService.registrar(buscarActor(actorId), "USER_CREATED", USER_MODULE,
                "Usuario creado: " + usuario.getCorreo(), ip);
        return UserResponse.from(usuario);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> listar(String rol, Boolean activo, String search, Pageable pageable) {
        return usuarioRepository.findAll(filtrar(rol, activo, search), pageable).map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse consultar(Long id) {
        return UserResponse.from(buscarUsuario(id));
    }

    @Transactional
    public UserResponse actualizar(Long id, UpdateUserRequest request, Long actorId, String ip) {
        Usuario usuario = buscarUsuario(id);
        if (usuarioRepository.existsByCorreoIgnoreCaseAndIdNot(request.correo(), id)) {
            throw new ConflictException("El correo ya esta registrado");
        }
        Rol nuevoRol = buscarRol(request.rol());
        boolean cambiaRol = !usuario.getRol().getNombre().equals(nuevoRol.getNombre());
        validarNoDesactivarUnicoAdmin(usuario, nuevoRol, request.activo());
        usuario.actualizar(request.nombre(), request.apellido(), request.correo(), nuevoRol, request.activo());
        Usuario guardado = usuarioRepository.save(usuario);
        Usuario actor = buscarActor(actorId);
        operationalAuditService.registrar(actor, "USER_UPDATED", USER_MODULE,
                "Usuario actualizado: " + guardado.getCorreo(), ip);
        if (cambiaRol) {
            operationalAuditService.registrar(actor, "USER_ROLE_CHANGED", USER_MODULE,
                    "Rol cambiado para usuario: " + guardado.getCorreo(), ip);
        }
        return UserResponse.from(guardado);
    }

    @Transactional
    public UserResponse activar(Long id, Long actorId, String ip) {
        Usuario usuario = buscarUsuario(id);
        usuario.activar();
        Usuario guardado = usuarioRepository.save(usuario);
        operationalAuditService.registrar(buscarActor(actorId), "USER_ACTIVATED", USER_MODULE,
                "Usuario activado: " + guardado.getCorreo(), ip);
        return UserResponse.from(guardado);
    }

    @Transactional
    public UserResponse desactivar(Long id, Long actorId, String ip) {
        Usuario usuario = buscarUsuario(id);
        validarNoDesactivarUnicoAdmin(usuario, usuario.getRol(), false);
        usuario.desactivar();
        Usuario guardado = usuarioRepository.save(usuario);
        operationalAuditService.registrar(buscarActor(actorId), "USER_DEACTIVATED", USER_MODULE,
                "Usuario desactivado: " + guardado.getCorreo(), ip);
        return UserResponse.from(guardado);
    }

    @Transactional
    public void cambiarPassword(Long id, ChangePasswordRequest request, Long actorId, String ip) {
        Usuario usuario = buscarUsuario(id);
        usuario.cambiarPassword(passwordEncoder.encode(request.password()));
        usuarioRepository.save(usuario);
        refreshTokenRevocationService.revocarActivosPorUsuario(usuario.getId());
        operationalAuditService.registrar(buscarActor(actorId), "USER_PASSWORD_CHANGED", USER_MODULE,
                "Password cambiado para usuario: " + usuario.getCorreo(), ip);
    }

    private void validarCorreoDisponible(String correo) {
        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ConflictException("El correo ya esta registrado");
        }
    }

    private void validarNoDesactivarUnicoAdmin(Usuario usuario, Rol rolDestino, boolean activoDestino) {
        boolean dejaDeSerAdminActivo = usuario.isActivo()
                && ADMIN_ROLE.equals(usuario.getRol().getNombre())
                && (!activoDestino || !ADMIN_ROLE.equals(rolDestino.getNombre()));
        if (dejaDeSerAdminActivo && usuarioRepository.countByRolNombreAndActivoTrue(ADMIN_ROLE) <= 1) {
            throw new BusinessRuleException("No se puede desactivar o degradar al unico administrador activo");
        }
    }

    private Rol buscarRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private Usuario buscarActor(Long actorId) {
        return usuarioRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
    }

    private Specification<Usuario> filtrar(String rol, Boolean activo, String search) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (rol != null && !rol.isBlank()) {
                predicates.add(builder.equal(root.get("rol").get("nombre"), rol));
            }
            if (activo != null) {
                predicates.add(builder.equal(root.get("activo"), activo));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("nombre")), pattern),
                        builder.like(builder.lower(root.get("apellido")), pattern),
                        builder.like(builder.lower(root.get("correo")), pattern)));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
