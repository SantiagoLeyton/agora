package com.agora.modules.gradebook.service;

import com.agora.config.GradebookProperties;
import com.agora.modules.academic.domain.GrupoDocente;
import com.agora.modules.gradebook.dto.GradeDistributionItem;
import com.agora.modules.gradebook.dto.GradebookAnalyticsResponse;
import com.agora.modules.gradebook.dto.GradebookDetailResponse;
import com.agora.modules.gradebook.dto.GradebookEntryResponse;
import com.agora.modules.gradebook.dto.GradebookFilterRequest;
import com.agora.modules.gradebook.dto.GradebookHistoryItemResponse;
import com.agora.modules.simulation.domain.FeedbackAuthor;
import com.agora.modules.simulation.domain.Intento;
import com.agora.modules.simulation.domain.Retroalimentacion;
import com.agora.modules.simulation.domain.SimulationStatus;
import com.agora.modules.simulation.dto.RdaComplianceStatus;
import com.agora.modules.simulation.dto.RdaEvaluationItemResponse;
import com.agora.modules.simulation.repository.IntentoRepository;
import com.agora.modules.simulation.repository.RetroalimentacionRepository;
import com.agora.modules.simulation.service.AttemptAccessService;
import com.agora.modules.simulation.service.AttemptSummaryService;
import com.agora.modules.simulation.service.PedagogicalAnalysisService;
import com.agora.modules.simulation.service.RdaEvaluationService;
import com.agora.security.UserPrincipal;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GradebookService {

    private final IntentoRepository intentoRepository;
    private final RetroalimentacionRepository retroalimentacionRepository;
    private final RdaEvaluationService rdaEvaluationService;
    private final AttemptAccessService accessService;
    private final AttemptSummaryService summaryService;
    private final PedagogicalAnalysisService pedagogicalAnalysisService;
    private final GradebookProperties gradebookProperties;

    @Transactional(readOnly = true)
    public Page<GradebookEntryResponse> listar(GradebookFilterRequest filters, UserPrincipal principal, Pageable pageable) {
        validarAcceso(principal);
        if ("ADMINISTRADOR".equals(principal.rol())) {
            registrarIntentosHuerfanosConNota();
        }
        Page<Intento> page = intentoRepository.findAll(buildSpecification(filters, principal), pageable);
        Map<Long, List<Retroalimentacion>> feedbackByAttempt = loadFeedback(page.getContent());
        return page.map(intento -> toEntry(intento, feedbackByAttempt.get(intento.getId())));
    }

    @Transactional(readOnly = true)
    public GradebookAnalyticsResponse analitica(GradebookFilterRequest filters, UserPrincipal principal) {
        validarAcceso(principal);
        List<Intento> intentos = intentoRepository.findAll(buildSpecification(filters, principal));
        BigDecimal threshold = gradebookProperties.getApprovalThreshold();
        List<BigDecimal> notas = intentos.stream()
                .map(Intento::getNotaFinal)
                .filter(Objects::nonNull)
                .toList();

        BigDecimal promedio = notas.isEmpty()
                ? BigDecimal.ZERO
                : notas.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(notas.size()), 2, RoundingMode.HALF_UP);
        BigDecimal mejor = notas.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal peor = notas.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        long aprobados = notas.stream().filter(nota -> nota.compareTo(threshold) >= 0).count();
        long reprobados = notas.size() - aprobados;

        return new GradebookAnalyticsResponse(
                promedio,
                mejor,
                peor,
                aprobados,
                reprobados,
                threshold,
                buildDistribution(notas));
    }

    @Transactional(readOnly = true)
    public GradebookDetailResponse detalle(Long attemptId, UserPrincipal principal, HttpServletRequest request) {
        validarAcceso(principal);
        Intento intento = accessService.buscarIntento(attemptId);
        accessService.validarLectura(intento, principal);
        Map<Long, List<Retroalimentacion>> feedback = loadFeedback(List.of(intento));
        GradebookEntryResponse entry = toEntry(intento, feedback.get(intento.getId()));
        var summary = summaryService.obtener(attemptId, principal, clientIp(request));
        var analysis = pedagogicalAnalysisService.analizar(attemptId, principal);
        List<GradebookHistoryItemResponse> historial = intentoRepository
                .findByEstudianteIdAndCasoIdOrderByFechaInicioDesc(intento.getEstudiante().getId(), intento.getCaso().getId())
                .stream()
                .map(item -> new GradebookHistoryItemResponse(
                        item.getId(),
                        presentationDate(item),
                        mapEstado(item.getEstado()),
                        item.getNotaFinal()))
                .toList();
        return new GradebookDetailResponse(entry, summary, analysis, historial);
    }

    @Transactional(readOnly = true)
    public List<GradebookEntryResponse> exportRows(GradebookFilterRequest filters, UserPrincipal principal) {
        validarAcceso(principal);
        List<Intento> intentos = intentoRepository.findAll(buildSpecification(filters, principal));
        Map<Long, List<Retroalimentacion>> feedbackByAttempt = loadFeedback(intentos);
        return intentos.stream()
                .map(intento -> toEntry(intento, feedbackByAttempt.get(intento.getId())))
                .toList();
    }

    private Specification<Intento> buildSpecification(GradebookFilterRequest filters, UserPrincipal principal) {
        return (root, query, builder) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(visibilityPredicate(root, query, builder, principal));
            if (filters.grupoId() != null) {
                predicates.add(builder.equal(root.join("programacion", JoinType.LEFT).join("grupo").get("id"),
                        filters.grupoId()));
            }
            if (filters.casoId() != null) {
                predicates.add(builder.equal(root.get("caso").get("id"), filters.casoId()));
            }
            if (filters.estudianteId() != null) {
                predicates.add(builder.equal(root.get("estudiante").get("id"), filters.estudianteId()));
            }
            if (filters.desde() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("fechaInicio"), filters.desde()));
            }
            if (filters.hasta() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("fechaInicio"), filters.hasta()));
            }
            if (filters.estado() != null && !filters.estado().isBlank()) {
                predicates.add(builder.equal(root.get("estado"),
                        parseEstado(filters.estado())));
            }
            if (filters.notaMinima() != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("notaFinal"), filters.notaMinima()));
            }
            if (filters.notaMaxima() != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("notaFinal"), filters.notaMaxima()));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Predicate visibilityPredicate(
            Root<Intento> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder builder,
            UserPrincipal principal) {
        if ("ADMINISTRADOR".equals(principal.rol()) || "DOCENTE_ADMIN".equals(principal.rol())) {
            return builder.conjunction();
        }
        if (!"DOCENTE".equals(principal.rol())) {
            return builder.disjunction();
        }
        var programacionJoin = root.join("programacion", JoinType.INNER);
        var grupoJoin = programacionJoin.join("grupo");
        Subquery<Long> coTeacher = query.subquery(Long.class);
        Root<GrupoDocente> coRoot = coTeacher.from(GrupoDocente.class);
        coTeacher.select(coRoot.get("grupo").get("id"));
        coTeacher.where(builder.equal(coRoot.get("docente").get("id"), principal.id()));
        return builder.or(
                builder.equal(grupoJoin.get("docente").get("id"), principal.id()),
                builder.equal(programacionJoin.get("docente").get("id"), principal.id()),
                grupoJoin.get("id").in(coTeacher));
    }

    private GradebookEntryResponse toEntry(Intento intento, List<Retroalimentacion> feedback) {
        List<RdaEvaluationItemResponse> rdaItems =
                rdaEvaluationService.evaluarCaso(intento.getCaso().getId(), intento.getId());
        int cumplidos = (int) rdaItems.stream().filter(item -> item.estado() == RdaComplianceStatus.CUMPLIDO).count();
        int parciales = (int) rdaItems.stream()
                .filter(item -> item.estado() == RdaComplianceStatus.PARCIALMENTE_CUMPLIDO)
                .count();
        int pendientes = (int) rdaItems.stream()
                .filter(item -> item.estado() == RdaComplianceStatus.NO_EVIDENCIADO)
                .count();
        String docenteFeedback = extractFeedback(feedback, FeedbackAuthor.DOCENTE);
        String iaFeedback = extractFeedback(feedback, FeedbackAuthor.IA);
        if (iaFeedback == null) {
            iaFeedback = extractFeedback(feedback, FeedbackAuthor.SISTEMA);
        }
        BigDecimal nota = intento.getNotaFinal();
        boolean aprobado = nota != null && nota.compareTo(gradebookProperties.getApprovalThreshold()) >= 0;
        var estudiante = intento.getEstudiante();
        var programacion = intento.getProgramacion();
        return new GradebookEntryResponse(
                intento.getId(),
                estudiante.getId(),
                estudiante.getNombre() + " " + estudiante.getApellido(),
                estudiante.getCorreo(),
                programacion == null ? null : programacion.getGrupo().getId(),
                programacion == null ? null : programacion.getGrupo().getNombre(),
                intento.getCaso().getId(),
                intento.getCaso().getTitulo(),
                programacion == null ? null : programacion.getId(),
                presentationDate(intento),
                mapEstado(intento.getEstado()),
                nota,
                cumplidos,
                parciales,
                pendientes,
                docenteFeedback,
                iaFeedback,
                aprobado);
    }

    private Map<Long, List<Retroalimentacion>> loadFeedback(List<Intento> intentos) {
        if (intentos.isEmpty()) {
            return Map.of();
        }
        List<Long> ids = intentos.stream().map(Intento::getId).toList();
        return retroalimentacionRepository.findByIntentoIdIn(ids).stream()
                .collect(Collectors.groupingBy(item -> item.getIntento().getId(), HashMap::new, Collectors.toList()));
    }

    private String extractFeedback(List<Retroalimentacion> feedback, FeedbackAuthor author) {
        if (feedback == null) {
            return null;
        }
        return feedback.stream()
                .filter(item -> item.getAutor() == author)
                .map(Retroalimentacion::getContenido)
                .filter(content -> content != null && !content.isBlank())
                .findFirst()
                .orElse(null);
    }

    private Instant presentationDate(Intento intento) {
        return intento.getFechaFin() != null ? intento.getFechaFin() : intento.getFechaInicio();
    }

    private String mapEstado(SimulationStatus estado) {
        return switch (estado) {
            case EN_PROCESO -> "En progreso";
            case FINALIZADO -> "Finalizado";
            case ABANDONADO -> "Abandonado";
        };
    }

    private SimulationStatus parseEstado(String estado) {
        String normalized = estado.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "EN_PROCESO", "EN PROGRESO" -> SimulationStatus.EN_PROCESO;
            case "FINALIZADO" -> SimulationStatus.FINALIZADO;
            case "ABANDONADO" -> SimulationStatus.ABANDONADO;
            default -> SimulationStatus.valueOf(normalized.replace(' ', '_'));
        };
    }

    private List<GradeDistributionItem> buildDistribution(List<BigDecimal> notas) {
        long bucket0 = notas.stream().filter(n -> n.compareTo(BigDecimal.ONE) < 0).count();
        long bucket1 = notas.stream().filter(n -> n.compareTo(BigDecimal.ONE) >= 0 && n.compareTo(new BigDecimal("2")) < 0)
                .count();
        long bucket2 = notas.stream().filter(n -> n.compareTo(new BigDecimal("2")) >= 0 && n.compareTo(new BigDecimal("3")) < 0)
                .count();
        long bucket3 = notas.stream().filter(n -> n.compareTo(new BigDecimal("3")) >= 0 && n.compareTo(new BigDecimal("4")) < 0)
                .count();
        long bucket4 = notas.stream().filter(n -> n.compareTo(new BigDecimal("4")) >= 0 && n.compareTo(new BigDecimal("5")) < 0)
                .count();
        long bucket5 = notas.stream().filter(n -> n.compareTo(new BigDecimal("5")) >= 0).count();
        return List.of(
                new GradeDistributionItem("0.0 - 0.9", bucket0),
                new GradeDistributionItem("1.0 - 1.9", bucket1),
                new GradeDistributionItem("2.0 - 2.9", bucket2),
                new GradeDistributionItem("3.0 - 3.9", bucket3),
                new GradeDistributionItem("4.0 - 4.9", bucket4),
                new GradeDistributionItem("5.0", bucket5));
    }

    private void validarAcceso(UserPrincipal principal) {
        if ("ESTUDIANTE".equals(principal.rol())) {
            throw new AccessDeniedException("Los estudiantes no pueden consultar el libro de calificaciones");
        }
        if (!List.of("ADMINISTRADOR", "DOCENTE_ADMIN", "DOCENTE").contains(principal.rol())) {
            throw new AccessDeniedException("Rol no autorizado");
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }

    private void registrarIntentosHuerfanosConNota() {
        long huerfanos = intentoRepository.findAll().stream()
                .filter(intento -> intento.getProgramacion() == null && intento.getNotaFinal() != null)
                .count();
        if (huerfanos > 0) {
            log.warn(
                    "Detectados {} intentos con nota pero sin programacion_id (no visibles en gradebook docente)",
                    huerfanos);
        }
    }
}
