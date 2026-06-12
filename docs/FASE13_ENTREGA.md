# Proyecto Ágora — Entrega Fase 13

## Alcance

Fase final: inteligencia pedagógica, comparación docente vs IA, histórico longitudinal, dashboard pedagógico, datos demo, QA, hardening de seguridad y documentación.

No se rehicieron fases anteriores. Se preservan autenticación, autorización, simulación, programación académica, evaluación, feedback, IA, métricas, RDA, DOCENTE_ADMIN y calificación 0–5.

## Cadena académica cerrada

```
Caso → RDA → Programación → Simulación → Intento → Nota → Feedback → Métricas pedagógicas
```

## Inteligencia pedagógica implementada

### Evaluación por RDA

- Vínculo `pregunta.resultado_aprendizaje_id` (migración V10).
- `RdaEvaluationService` calcula cumplimiento por respuestas reales: `pesoPuntos × porcentajeCredito`.
- Estados: `CUMPLIDO` (≥70%), `PARCIALMENTE_CUMPLIDO` (≥40%), `NO_EVIDENCIADO`.
- Endpoint: `GET /api/v1/attempts/{attemptId}/rda-evaluation`.

### Comparación docente vs IA

- UI en `/evaluation/results/[id]` con `FeedbackComparisonPanel`.
- Lectura paralela de retroalimentación `DOCENTE` / `SISTEMA` y síntesis IA sin modificar contenido.

### Histórico longitudinal

- `PedagogicalAnalyticsService` agrega intentos finalizados por estudiante.
- Endpoints:
  - `GET /api/v1/academic-progress/me` (ESTUDIANTE)
  - `GET /api/v1/academic-progress/students/{studentId}` (DOCENTE, DOCENTE_ADMIN, ADMINISTRADOR)
- UI en `/evaluation/history` con `AcademicProgressTimeline`.

### Dashboard pedagógico

- `PedagogicalInsightsService` integrado en `GET /api/v1/teacher/metrics`.
- Indicadores: promedio de notas, RDA más cumplidos / con dificultades, estudiantes con progreso positivo y que requieren seguimiento.
- UI en `/teacher/metrics` con `PedagogicalInsightsPanel`.

## Arquitectura

| Capa | Tecnología |
|------|------------|
| Backend | Spring Boot 3.5, Java 21, Flyway, PostgreSQL |
| Frontend | Next.js 16, React, TanStack Query |
| Auth | JWT + roles |

### Módulos backend relevantes

- `simulation` — intentos, RDA evaluation, progreso académico
- `metrics` — métricas docentes, insights pedagógicos
- `case_management` — casos, preguntas vinculadas a RDA
- `academic` — grupos, programaciones
- `feedback` / `ai` — retroalimentación y síntesis IA

### Módulos frontend relevantes

- `modules/evaluation` — RDA, comparación feedback, timeline
- `modules/teacher` — dashboard pedagógico
- `services/pedagogical-service.ts` — cliente API fase 13

## Modelo de datos (extensiones Fase 13)

```sql
ALTER TABLE pregunta ADD COLUMN resultado_aprendizaje_id BIGINT REFERENCES resultado_aprendizaje(id);
```

Datos demo en V10: caso "Caso Demo Presentacion Agora", 2 RDA, 3 intentos finalizados (notas 3.13, 4.38, 5.0), feedback docente/sistema e IA.

## Roles y permisos

| Rol | RDA eval | Progreso propio | Progreso estudiante | Métricas pedagógicas |
|-----|----------|-----------------|---------------------|----------------------|
| ESTUDIANTE | ✓ (propios) | ✓ | ✗ | ✗ |
| DOCENTE | ✓ (grupos) | ✗ | ✓ | ✓ |
| DOCENTE_ADMIN | ✓ | ✗ | ✓ | ✓ |
| ADMINISTRADOR | según participación | ✗ | ✓ | ✓ |

Expresiones en `SecurityExpressions`: `ACADEMIC_PARTICIPANT`, `ACADEMIC_PROGRESS`, `TEACHER_METRICS`, `TEACHER_FEEDBACK`.

## Endpoints principales (Fase 13)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/attempts/{id}/rda-evaluation` | Cumplimiento RDA del intento |
| GET | `/api/v1/academic-progress/me` | Evolución del estudiante autenticado |
| GET | `/api/v1/academic-progress/students/{id}` | Evolución para docente/admin |
| GET | `/api/v1/teacher/metrics` | Métricas + `pedagogicalInsights` |

## Sistema de calificación

Escala 0–5 en intentos finalizados (`nota_final`). La UI de evaluación muestra `/ 5` (corregido respecto a porcentajes erróneos).

## Sistema RDA

1. Docente/DOCENTE_ADMIN define RDAs por caso.
2. Preguntas graduadas se vinculan a un RDA.
3. Respuestas del intento alimentan el cálculo de cumplimiento.
4. Resultados visibles en detalle de evaluación e histórico.

## Validación

```bash
# Backend (Docker)
DOCKER_HOST=unix:///var/run/docker.sock docker compose --profile full up -d --build backend

# Runtime Fase 13
node frontend/scripts/validate-phase13.mjs

# Frontend
cd frontend && npm run lint && npm run typecheck && npm run build
```

## Archivos creados (principales)

**Backend**

- `V10__phase13_pedagogical_intelligence.sql`
- `RdaEvaluationService`, `PedagogicalAnalyticsService`, `PedagogicalInsightsService`
- `PedagogicalAnalyticsController`
- DTOs: `RdaEvaluationItemResponse`, `AcademicProgressResponse`, `PedagogicalInsightsResponse`

**Frontend**

- `types/pedagogical.ts`
- `services/pedagogical-service.ts`
- `modules/evaluation/components/rda-evaluation-panel.tsx`
- `modules/evaluation/components/feedback-comparison-panel.tsx`
- `modules/evaluation/components/academic-progress-timeline.tsx`
- `modules/teacher/components/pedagogical-insights-panel.tsx`
- `scripts/validate-phase13.mjs`

## Archivos modificados (principales)

- Backend: `Pregunta`, `QuestionRequest/Response`, `AttemptSummaryService`, `TeacherMetricsService`, `SecurityExpressions`, controladores de permisos
- Frontend: páginas evaluation/results, evaluation/history, teacher/metrics; `evaluation-cards`, `evaluation-adapters`, `use-data`, `teacher-metrics.ts`

## Riesgos detectados

- Evaluación RDA depende de preguntas con `pesoPuntos` y vínculo RDA; casos legacy sin vínculo muestran estado vacío (comportamiento esperado).
- Docker Desktop vs socket del sistema: usar `DOCKER_HOST=unix:///var/run/docker.sock` si aplica.

## Fuera de alcance

- Nuevas tablas de analytics independientes (se usan agregaciones sobre datos existentes).
- Modificación del contenido de feedback o IA (solo comparación visual).
- Calificación granular por RDA independiente de la nota global del intento.

## Credenciales demo

| Usuario | Rol | Password |
|---------|-----|----------|
| admin@agora.com | ADMINISTRADOR | Agora12345* |
| docente@agora.com | DOCENTE | Agora12345* |
| docente_admin@agora.com | DOCENTE_ADMIN | Agora12345* |
| estudiante@agora.com | ESTUDIANTE | Agora12345* |
