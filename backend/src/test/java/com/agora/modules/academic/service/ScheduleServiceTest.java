package com.agora.modules.academic.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.academic.domain.Grupo;
import com.agora.modules.academic.domain.Programacion;
import com.agora.modules.academic.dto.CreateScheduleRequest;
import com.agora.modules.academic.dto.ScheduleResponse;
import com.agora.modules.academic.repository.GrupoRepository;
import com.agora.modules.academic.repository.ProgramacionRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock ProgramacionRepository programacionRepository;
    @Mock GrupoRepository grupoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock OperationalAuditService auditService;

    private ScheduleService service;
    private Usuario docente;

    @BeforeEach
    void setUp() {
        service = new ScheduleService(programacionRepository, grupoRepository, usuarioRepository,
                new AcademicAccessService(), auditService);
        docente = new Usuario(new Rol("DOCENTE", ""), "Docente", "Agora", "docente@agora.com", "hash");
        ReflectionTestUtils.setField(docente, "id", 1L);
    }

    @Test
    void createsValidScheduleForOwnedGroup() {
        Grupo grupo = new Grupo(docente, "Grupo A", "Base", "2026-1");
        ReflectionTestUtils.setField(grupo, "id", 10L);
        Instant inicio = Instant.parse("2026-06-05T10:00:00Z");
        Instant fin = Instant.parse("2026-06-05T12:00:00Z");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(docente));
        when(grupoRepository.findById(10L)).thenReturn(Optional.of(grupo));
        when(programacionRepository.save(any(Programacion.class))).thenAnswer(invocation -> {
            Programacion programacion = invocation.getArgument(0);
            ReflectionTestUtils.setField(programacion, "id", 20L);
            return programacion;
        });

        ScheduleResponse response = service.crear(new CreateScheduleRequest(10L, null, inicio, fin),
                new UserPrincipal(1L, "Docente", "Agora", "docente@agora.com", "hash", "DOCENTE", true),
                "127.0.0.1");

        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.fechaInicio()).isEqualTo(inicio);
        verify(auditService).registrar(docente, "SCHEDULE_CREATED", "ACADEMIC",
                "Programacion creada para grupo: 10", "127.0.0.1");
    }
}
