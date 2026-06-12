package com.agora.modules.case_management.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.agora.infrastructure.audit.OperationalAuditService;
import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.domain.Escena;
import com.agora.modules.case_management.domain.Opcion;
import com.agora.modules.case_management.domain.Pregunta;
import com.agora.modules.case_management.dto.CaseBuilderResponse;
import com.agora.modules.case_management.dto.CaseRequest;
import com.agora.modules.case_management.dto.OptionRequest;
import com.agora.modules.case_management.dto.QuestionRequest;
import com.agora.modules.case_management.dto.SceneRequest;
import com.agora.modules.case_management.repository.CasoRepository;
import com.agora.modules.case_management.repository.EntidadInstitucionalRepository;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.HerramientaRepository;
import com.agora.modules.case_management.repository.OpcionRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.modules.case_management.repository.ResultadoAprendizajeRepository;
import com.agora.modules.user.domain.Rol;
import com.agora.modules.user.domain.Usuario;
import com.agora.modules.user.repository.UsuarioRepository;
import com.agora.security.UserPrincipal;
import com.agora.shared.exception.ConflictException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CaseManagementServiceTest {

    @Mock CasoRepository casoRepository;
    @Mock HerramientaRepository herramientaRepository;
    @Mock EntidadInstitucionalRepository entidadRepository;
    @Mock EscenaRepository escenaRepository;
    @Mock PreguntaRepository preguntaRepository;
    @Mock OpcionRepository opcionRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock ResultadoAprendizajeRepository resultadoRepository;
    @Mock LearningOutcomeService learningOutcomeService;
    @Mock OperationalAuditService auditService;

    private CaseService caseService;
    private CaseContentService contentService;
    private CaseBuilderService builderService;
    private UserPrincipal teacher;
    private Usuario actor;

    @BeforeEach
    void setUp() {
        caseService = new CaseService(casoRepository, herramientaRepository, entidadRepository, usuarioRepository,
                resultadoRepository, auditService);
        contentService = new CaseContentService(caseService, escenaRepository, preguntaRepository, opcionRepository,
                resultadoRepository, usuarioRepository, auditService);
        builderService = new CaseBuilderService(caseService, learningOutcomeService, escenaRepository, preguntaRepository,
                opcionRepository);
        teacher = new UserPrincipal(1L, "Docente", "Agora", "docente@agora.com", "hash", "DOCENTE", true);
        actor = new Usuario(new Rol("DOCENTE", ""), "Docente", "Agora", "docente@agora.com", "hash");
        ReflectionTestUtils.setField(actor, "id", 1L);
    }

    @Test
    void createsCase() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(actor));
        when(casoRepository.save(any(Caso.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 10L));
        when(resultadoRepository.findByCasoIdOrderByOrdenAsc(10L)).thenReturn(List.of());

        var response = caseService.crear(new CaseRequest("Caso A", "Desc", "Obj", "BASICO", 45),
                teacher, "127.0.0.1");

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.titulo()).isEqualTo("Caso A");
    }

    @Test
    void rejectsDuplicateSceneOrder() {
        when(escenaRepository.existsByCasoIdAndOrden(10L, 1)).thenReturn(true);

        assertThatThrownBy(() -> contentService.crearEscena(10L,
                new SceneRequest(1, "Escena", null, "Contenido", true), teacher, "127.0.0.1"))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Ya existe una escena con ese orden para el caso");
    }

    @Test
    void createsQuestionAndOption() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(actor));
        Caso caso = withId(new Caso("Caso", null, null, "BASICO", 30, null), 10L);
        Escena escena = withId(new Escena(caso, 1, "Escena", null, "Contenido"), 20L);
        Pregunta pregunta = withId(new Pregunta(escena, "Pregunta", true), 30L);
        when(escenaRepository.findById(20L)).thenReturn(Optional.of(escena));
        when(preguntaRepository.save(any(Pregunta.class))).thenReturn(pregunta);
        when(preguntaRepository.findById(30L)).thenReturn(Optional.of(pregunta));
        when(opcionRepository.save(any(Opcion.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 40L));

        var question = contentService.crearPregunta(20L, new QuestionRequest("Pregunta", true, true, null, null),
                teacher, "127.0.0.1");
        var option = contentService.crearOpcion(30L, new OptionRequest("Opcion", "Desc", 1, true, null),
                teacher, "127.0.0.1");

        assertThat(question.id()).isEqualTo(30L);
        assertThat(option.orden()).isEqualTo(1);
    }

    @Test
    void buildsCompleteCase() {
        Caso caso = withId(new Caso("Caso", null, null, "BASICO", 30, null), 10L);
        Escena escena = withId(new Escena(caso, 1, "Escena", null, "Contenido"), 20L);
        Pregunta pregunta = withId(new Pregunta(escena, "Pregunta", true), 30L);
        Opcion opcion = withId(new Opcion(pregunta, "Opcion", null, 1), 40L);
        when(casoRepository.findById(10L)).thenReturn(Optional.of(caso));
        when(learningOutcomeService.listarPorCaso(10L)).thenReturn(List.of());
        when(escenaRepository.findByCasoIdOrderByOrdenAsc(10L)).thenReturn(List.of(escena));
        when(preguntaRepository.findByEscenaIdOrderByIdAsc(20L)).thenReturn(List.of(pregunta));
        when(opcionRepository.findByPreguntaIdOrderByOrdenAsc(30L)).thenReturn(List.of(opcion));

        CaseBuilderResponse response = builderService.obtener(10L, teacher);

        assertThat(response.caso().id()).isEqualTo(10L);
        assertThat(response.escenas()).hasSize(1);
        assertThat(response.escenas().getFirst().preguntas().getFirst().opciones()).hasSize(1);
    }

    private <T> T withId(T entity, Long id) {
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }
}
