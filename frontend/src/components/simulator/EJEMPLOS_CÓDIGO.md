# 📝 Ejemplos de Código - Rediseño de Resultados

## Importación en el Componente Principal

```tsx
// simulator-play-view.tsx
import { CompletionBanner } from "@/components/simulator/CompletionBanner";
import { SimulationResults } from "@/components/simulator/SimulationResults";

// Los otros componentes (ResultCard, ResultList) se importan automáticamente
// dentro de SimulationResults
```

---

## Uso del Banner de Completitud

```tsx
// Mostrar cuando isComplete === true
<CompletionBanner
  duration={session?.elapsedSeconds ?? 0}
  allianceScore={emotionalProfile.therapeuticAlliance}
/>

// Props esperadas:
// - duration: number (segundos)
// - allianceScore: number (0-100)

// Ejemplo de output:
// ✅ Sesión completada exitosamente
// Duración: 5m 32s • Alianza terapéutica alcanzada: 82%
```

---

## Uso de SimulationResults

```tsx
<SimulationResults
  summary={sessionSummary}
  formativeFeedback={formativeFeedback}
  lastImpact={lastImpact}
  className="my-8" // opcional
/>

// Props esperadas:
// 1. summary: ClinicalSessionSummary | null
//    - title: string
//    - factorsIdentified: string[]
//    - strengthsObserved: string[]
//    - closingNote?: string
//
// 2. formativeFeedback: FormativeFeedbackSlot | null
//    - title: string
//    - observation: string
//    - teacherComment?: string
//    - aiSuggestion?: string
//
// 3. lastImpact: ClinicalImpactDelta[]
//    - label: string (ej: "Ansiedad")
//    - delta: number (ej: -15, +12)

// El componente automáticamente:
// ✅ Filtra impactos positivos y negativos
// ✅ Crea animaciones staggered
// ✅ Maneja estados vacíos
// ✅ Responde a cambios de datos
```

---

## Ejemplo de Props Reales

```tsx
// Ejemplo 1: Caso completo
<SimulationResults
  summary={{
    title: "Resumen clínico",
    factorsIdentified: [
      "Presión académica y evaluaciones próximas.",
      "Expectativas elevadas en el entorno familiar.",
      "Pensamientos anticipatorios negativos.",
      "Activación somática (tensión, sueño alterado).",
    ],
    strengthsObserved: [
      "Disposición al diálogo.",
      "Capacidad reflexiva en momentos de la sesión.",
      "Apertura progresiva al explorar temas sensibles.",
    ],
    closingNote: "Este resumen es formativo y no constituye diagnóstico clínico definitivo.",
    source: "rules",
  }}
  formativeFeedback={{
    title: "Retroalimentación",
    observation: "Has realizado una exploración sólida de los factores relacionados con la ansiedad académica del paciente, demostrando empatía y validación emocional.",
    teacherComment: "Excelente manejo de la alianza. Considera profundizar en estrategias de afrontamiento en la siguiente sesión.",
    aiSuggestion: "La intervención fue empática. Para mejorar, intenta explorar más la perspectiva del paciente sobre sus recursos.",
    source: "rules",
  }}
  lastImpact={[
    { label: "Alianza terapéutica", delta: 12 },
    { label: "Confianza", delta: 8 },
    { label: "Estabilidad", delta: 5 },
    { label: "Empatía percibida", delta: -3 },
  ]}
/>

// Ejemplo 2: Caso minimal (solo resumen)
<SimulationResults
  summary={{
    title: "Resumen clínico",
    factorsIdentified: ["Factor 1"],
    strengthsObserved: ["Fortaleza 1"],
  }}
/>

// Ejemplo 3: Caso vacío (no renderiza nada)
<SimulationResults
  summary={null}
  formativeFeedback={null}
  lastImpact={[]}
/>
```

---

## Personalización de ResultCard

```tsx
// Uso avanzado (si necesitas ResultCard separately)
import { ResultCard } from "@/components/simulator/ResultCard";
import { ResultList } from "@/components/simulator/ResultList";

<ResultCard
  title="Observaciones clínicas"
  variant="info"
  index={0}
>
  <ResultList
    items={[
      "El paciente mostró apertura emocional",
      "Conexión genuina durante la exploración",
      "Respuestas coherentes y reflexivas",
    ]}
    variant="info"
  />
</ResultCard>

// Variantes disponibles:
// - variant="default" → border-border/40 bg-card/70
// - variant="success" → border-success/20 bg-success/[0.04]
// - variant="info"    → border-info/20 bg-info/[0.04]
// - variant="warning" → border-warning/20 bg-warning/[0.04]

// index prop para animaciones staggered:
// index={0} → 150ms delay
// index={1} → 230ms delay
// index={2} → 310ms delay
// etc.
```

---

## Integración Completa en SimulatorPlayView

```tsx
// Fragmento del componente principal
export function SimulatorPlayView({ caseItem }: SimulatorPlayViewProps) {
  // ... setup y hooks ...

  // NUEVA LÓGICA DE DOS FASES
  if (isComplete) {
    return (
      <div className="flex h-full min-h-0 w-full max-w-none flex-col overflow-y-auto bg-background">
        {/* Cabecera móvil */}
        <ClinicalSessionHeader
          caseTitle={caseItem.title}
          category={caseItem.category}
          progress={100}
          isComplete={true}
          className="shrink-0 lg:hidden"
        />

        {/* Zona 1: Simulación (fija en viewport superior) */}
        <div className="flex shrink-0 flex-col min-h-screen lg:grid lg:grid-cols-[18fr_57fr_25fr] lg:min-h-[100vh]">
          {/* Sidebar (desktop) */}
          <ClinicalSessionSidebar
            caseTitle={caseItem.title}
            category={caseItem.category}
            progress={100}
            setting={currentScene.setting}
            supportTools={currentScene.supportTools}
            patientPedagogy={patientPedagogy}
            sessionLog={sessionLog}
            sessionSummary={sessionSummary}
            formativeFeedback={formativeFeedback}
            className="hidden min-h-0 overflow-y-auto lg:flex"
          />

          {/* Centro: Simulación clínica */}
          <div className="flex min-h-0 min-w-0 flex-col border-border/40 lg:border-x">
            <div className="grid min-h-full grid-rows-[minmax(0,40fr)_minmax(0,60fr)] overflow-hidden">
              <ClinicalSessionStage {...stageProps} />
              <ClinicalDialoguePanel {...dialogueProps} />
            </div>
          </div>

          {/* Derecha: Panel de intervenciones (desktop) */}
          <aside className="hidden min-h-0 min-w-0 flex-col overflow-hidden bg-card/30 lg:flex">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
              <p className="py-6 text-center text-xs text-muted-foreground">
                Sesión finalizada. No hay intervenciones pendientes.
              </p>
            </div>
          </aside>
        </div>

        {/* Zona 2: Banner de transición + Resultados (scroll principal) */}
        <CompletionBanner
          duration={session?.elapsedSeconds ?? 0}
          allianceScore={emotionalProfile.therapeuticAlliance}
        />

        <SimulationResults
          summary={sessionSummary}
          formativeFeedback={formativeFeedback}
          lastImpact={lastImpact}
        />

        {/* Zona 3: CTA Footer */}
        <div className="border-t border-border/40 bg-card/30 px-4 py-4 sm:px-6 sm:py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/simulator">
                Volver al repositorio
              </Link>
            </Button>
            <Button
              onClick={() => router.push("/evaluation")}
              className="w-full sm:w-auto"
            >
              Ver análisis completo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fase activa (sin cambios respecto al original)
  return (
    <div className="flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden">
      {/* ... contenido original ... */}
    </div>
  );
}
```

---

## Estructura de Carpetas

```
frontend/src/
├── components/
│   └── simulator/
│       ├── ResultCard.tsx              ← NUEVO
│       ├── ResultList.tsx              ← NUEVO
│       ├── CompletionBanner.tsx        ← NUEVO
│       ├── SimulationResults.tsx       ← NUEVO
│       │
│       ├── RESUMEN_EJECUTIVO.md        ← DOCUMENTACIÓN
│       ├── REDISEÑO_RESULTADOS.md      ← DOCUMENTACIÓN
│       ├── GUÍA_INTEGRACIÓN.md         ← DOCUMENTACIÓN
│       ├── COMPARATIVA_VISUAL.md       ← DOCUMENTACIÓN
│       │
│       ├── ClinicalSessionStage.tsx
│       ├── ClinicalDialoguePanel.tsx
│       ├── ClinicalSessionArtifacts.tsx (sin cambios)
│       └── ... otros componentes ...
│
└── modules/
    └── simulator/
        └── components/
            └── simulator-play-view.tsx  ← MODIFICADO
```

---

## Testing - Casos de Uso

```tsx
// Test: Renderizar con todos los datos
const mockSummary: ClinicalSessionSummary = {
  title: "Resumen clínico",
  factorsIdentified: ["Factor 1", "Factor 2"],
  strengthsObserved: ["Fortaleza 1", "Fortaleza 2"],
  closingNote: "Nota de cierre...",
};

const mockFeedback: FormativeFeedbackSlot = {
  title: "Retroalimentación",
  observation: "Observación...",
  teacherComment: "Comentario docente...",
  aiSuggestion: "Sugerencia IA...",
};

const mockImpacts: ClinicalImpactDelta[] = [
  { label: "Alianza", delta: 12 },
  { label: "Empatía", delta: -3 },
];

render(
  <SimulationResults
    summary={mockSummary}
    formativeFeedback={mockFeedback}
    lastImpact={mockImpacts}
  />
);

// Assertions:
// ✅ Banner aparece
// ✅ Título visible
// ✅ Factores listados
// ✅ Fortalezas listadas
// ✅ Cambios positivos con badge
// ✅ Áreas de mejora con badge
// ✅ Retroalimentación visible
// ✅ Próximos pasos visible
// ✅ Botones funcionales

// Test: Estados vacíos
render(
  <SimulationResults
    summary={null}
    formativeFeedback={null}
    lastImpact={undefined}
  />
);
// ✅ Retorna null (no renderiza nada)

// Test: Datos parciales
render(
  <SimulationResults
    summary={mockSummary}
    formativeFeedback={null}
    lastImpact={undefined}
  />
);
// ✅ Solo renderiza ResultCard de resumen
// ✅ Omite otros cards
```

---

## Customización Avanzada

```tsx
// Personalizar colores del ResultCard
<ResultCard
  title="Métrica Custom"
  variant="warning"  // ← Cambia colores
  index={2}
>
  <div className="space-y-3">
    <p>Contenido personalizado</p>
    <div className="flex gap-2">
      {/* Items custom */}
    </div>
  </div>
</ResultCard>

// Personalizar espaciado
<SimulationResults
  summary={summary}
  formativeFeedback={feedback}
  lastImpact={impacts}
  className="px-8 py-16"  // ← Override padding
/>

// Personalizar animaciones
// (modifica en SimulationResults.tsx)
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.12,  // Aumenta delay entre items
      delayChildren: 0.3,     // Delay inicial más largo
    }
  }
};
```

---

## Notas Importantes

### Importaciones Requeridas
```tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";
import { CheckCircle2, AlertCircle, Zap, /* ... */ } from "lucide-react";
```

### Tipos Esperados
```tsx
import type {
  ClinicalSessionSummary,
  FormativeFeedbackSlot,
  ClinicalAiContentSlots,
} from "@/types/clinical-session-artifacts";

import type { ClinicalImpactDelta } from "@/lib/clinical-impact";
```

### Funciones Auxiliares Existentes
```tsx
// Ya existen en el codebase:
- getEmotionalProfile()
- buildClinicalSessionSummary()
- buildFormativeFeedbackPreview()
- buildClinicalSessionLog()
```

### No Requiere Cambios
```
❌ No modificar:
  - ClinicalSessionHeader
  - ClinicalSessionSidebar
  - ClinicalDialoguePanel
  - ClinicalSessionStage
  - ClinicalSessionFooter
  - DecisionPanel
  - useSimulatorStore
```
