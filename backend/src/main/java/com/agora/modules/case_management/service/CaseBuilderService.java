package com.agora.modules.case_management.service;

import com.agora.modules.case_management.domain.Caso;
import com.agora.modules.case_management.dto.CaseBuilderResponse;
import com.agora.modules.case_management.dto.CaseResponse;
import com.agora.modules.case_management.dto.InstitutionalEntityResponse;
import com.agora.modules.case_management.dto.OptionResponse;
import com.agora.modules.case_management.dto.QuestionResponse;
import com.agora.modules.case_management.dto.SceneResponse;
import com.agora.modules.case_management.dto.ToolResponse;
import com.agora.modules.case_management.repository.EscenaRepository;
import com.agora.modules.case_management.repository.OpcionRepository;
import com.agora.modules.case_management.repository.PreguntaRepository;
import com.agora.security.UserPrincipal;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CaseBuilderService {

    private final CaseService caseService;
    private final EscenaRepository escenaRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRepository opcionRepository;

    @Transactional(readOnly = true)
    public CaseBuilderResponse obtener(Long id, UserPrincipal principal) {
        Caso caso = caseService.buscarCaso(id);
        caseService.validarLectura(caso, principal);
        var escenas = escenaRepository.findByCasoIdOrderByOrdenAsc(id).stream()
                .map(escena -> new CaseBuilderResponse.BuilderSceneResponse(SceneResponse.from(escena),
                        preguntaRepository.findByEscenaIdOrderByIdAsc(escena.getId()).stream()
                                .map(pregunta -> new CaseBuilderResponse.BuilderQuestionResponse(
                                        QuestionResponse.from(pregunta),
                                        opcionRepository.findByPreguntaIdOrderByOrdenAsc(pregunta.getId()).stream()
                                                .map(OptionResponse::from)
                                                .toList()))
                                .toList()))
                .toList();
        var herramientas = caso.getHerramientas().stream()
                .sorted(Comparator.comparing(Herramienta -> Herramienta.getId()))
                .map(ToolResponse::from)
                .toList();
        var entidades = caso.getEntidades().stream()
                .sorted(Comparator.comparing(entidad -> entidad.getId()))
                .map(InstitutionalEntityResponse::from)
                .toList();
        return new CaseBuilderResponse(CaseResponse.from(caso), escenas, herramientas, entidades);
    }
}
