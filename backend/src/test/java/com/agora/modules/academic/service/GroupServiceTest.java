package com.agora.modules.academic.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.GrupoEstudiante;
import com.agora.modules.academic.dto.AddGroupStudentRequest;
import com.agora.modules.academic.dto.CreateGroupRequest;
import com.agora.modules.academic.dto.GroupResponse;
import com.agora.modules.academic.dto.GroupStudentResponse;
import com.agora.modules.academic.repository.GrupoEstudianteRepository;
import com.agora.modules.academic.repository.GrupoRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.BusinessRuleException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock GrupoRepository grupoRepository;
    @Mock GrupoEstudianteRepository grupoEstudianteRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock OperationalAuditService auditService;

    private GroupService service;
    private Usuario docente;
    private Usuario estudiante;

    @BeforeEach
    void setUp() {
        service = new GroupService(grupoRepository, grupoEstudianteRepository, usuarioRepository,
                new AcademicAccessService(), auditService);
        docente = usuario(1L, "DOCENTE", "docente@agora.com");
        estudiante = usuario(2L, "ESTUDIANTE", "estudiante@agora.com");
    }

    @Test
    void createsGroupForTeacher() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(docente));
        when(grupoRepository.save(any(Grupo.class))).thenAnswer(invocation -> {
            Grupo grupo = invocation.getArgument(0);
            ReflectionTestUtils.setField(grupo, "id", 10L);
            return grupo;
        });

        GroupResponse response = service.crear(new CreateGroupRequest("Grupo A", "Base", "2026-1"),
                principal(1L, "DOCENTE"), "127.0.0.1");

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.docenteId()).isEqualTo(1L);
        verify(auditService).registrar(docente, "GROUP_CREATED", "ACADEMIC", "Grupo creado: Grupo A", "127.0.0.1");
    }

    @Test
    void addsStudentToGroup() {
        Grupo grupo = grupo();
        when(grupoRepository.findById(10L)).thenReturn(Optional.of(grupo));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(estudiante));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(docente));
        when(grupoEstudianteRepository.existsByGrupoIdAndEstudianteId(10L, 2L)).thenReturn(false);
        when(grupoEstudianteRepository.save(any(GrupoEstudiante.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        GroupStudentResponse response = service.agregarEstudiante(10L, new AddGroupStudentRequest(2L),
                principal(1L, "DOCENTE"), "127.0.0.1");

        assertThat(response.id()).isEqualTo(2L);
        verify(auditService).registrar(docente, "STUDENT_ADDED_TO_GROUP", "ACADEMIC",
                "Estudiante agregado al grupo: estudiante@agora.com", "127.0.0.1");
    }

    @Test
    void rejectsUserWithoutStudentRoleWhenAddingToGroup() {
        Grupo grupo = grupo();
        Usuario otroDocente = usuario(3L, "DOCENTE", "otro@agora.com");
        when(grupoRepository.findById(10L)).thenReturn(Optional.of(grupo));
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(otroDocente));

        assertThatThrownBy(() -> service.agregarEstudiante(10L, new AddGroupStudentRequest(3L),
                principal(1L, "DOCENTE"), "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("El usuario no tiene rol ESTUDIANTE");
    }

    private Grupo grupo() {
        Grupo grupo = new Grupo(docente, "Grupo A", "Base", "2026-1");
        ReflectionTestUtils.setField(grupo, "id", 10L);
        return grupo;
    }

    private Usuario usuario(Long id, String rol, String correo) {
        Usuario usuario = new Usuario(new Rol(rol, ""), "Nombre", "Apellido", correo, "hash");
        ReflectionTestUtils.setField(usuario, "id", id);
        return usuario;
    }

    private UserPrincipal principal(Long id, String rol) {
        return new UserPrincipal(id, "Nombre", "Apellido", "user@agora.com", "hash", rol, true);
    }
}
