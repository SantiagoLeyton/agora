"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClinicalSessionHeader } from "@/components/simulator/ClinicalSessionHeader";
import { ClinicalSessionSidebar } from "@/components/simulator/ClinicalSessionSidebar";
import { ClinicalSessionFooter } from "@/components/simulator/ClinicalSessionFooter";
import { CompletionBanner } from "@/components/simulator/CompletionBanner";
import { SimulationResults } from "@/components/simulator/SimulationResults";
import { DecisionPanel } from "@/modules/simulator/components/decision-panel";
import { useSimulatorStore, useAuthStore } from "@/store";
import {
  useAttemptSummary,
  useCaseBuilder,
  useAnswerSimulation,
  useFinishSimulation,
  useSimulation,
  useStartSimulation,
} from "@/hooks/use-data";
import { mapBuilderToScenes, mapSimulationToSession } from "@/lib/case-adapters";
import { simulationService } from "@/services/simulation-service";
import { getEmotionalProfile } from "@/lib/simulator-clinical";
import {
  mapProfileToLive2dExpression,
  getLive2dExpressionLabel,
  mapPsychologistStateToLive2dExpression,
  categoryToPsychologistState,
} from "@/lib/live2d-expressions";
import { buildClinicalDialogueHistory } from "@/lib/clinical-dialogue";
import { buildPatientPedagogy } from "@/lib/clinical-pedagogy";
import { buildSessionPhaseTimeline } from "@/lib/clinical-session-phases";
import { getCurrentClinicalObjective } from "@/lib/clinical-session-objective";
import { buildClinicalSessionLog } from "@/lib/clinical-session-log";
import {
  buildClinicalSessionSummary,
  buildFormativeFeedbackPreview,
} from "@/lib/clinical-session-summary";
import { getComplementaryLive2DModel } from "@/lib/live2d-models";
import { PSYCHOLOGIST_STATE_LABELS } from "@/lib/session-participants";
import {
  buildPatientParticipant,
  buildPsychologistParticipant,
} from "@/lib/session-participants";
import { PatientModelPicker } from "@/components/simulator/PatientModelPicker";
import type { DialogueOption, PatientLive2DModel, PsychologistVisualState, SimulationCase } from "@/types";

const ClinicalSessionStage = dynamic(
  () =>
    import("@/components/simulator/ClinicalSessionStage").then(
      (m) => m.ClinicalSessionStage
    ),
  { ssr: false }
);

const ClinicalDialoguePanel = dynamic(
  () =>
    import("@/components/simulator/ClinicalDialoguePanel").then(
      (m) => m.ClinicalDialoguePanel
    ),
  { ssr: false }
);

interface SimulatorPlayViewProps {
  caseItem: SimulationCase;
}

export function SimulatorPlayView({ caseItem }: SimulatorPlayViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programacionId = searchParams.get("programacionId");
  const user = useAuthStore((s) => s.user);
  const { session, setSession } = useSimulatorStore();
  const [interactionNonce, setInteractionNonce] = useState(0);
  const finishRequestedRef = useRef(false);

  const activeAttemptId =
    session?.caseId === caseItem.id ? session.attemptId : undefined;
  const { data: builder, isLoading: isBuilderLoading } = useCaseBuilder(caseItem.id);
  const { data: simulation } = useSimulation(activeAttemptId);
  const { data: summary } = useAttemptSummary(activeAttemptId);
  const startSimulation = useStartSimulation();
  const answerSimulation = useAnswerSimulation(activeAttemptId ?? 0);
  const finishSimulation = useFinishSimulation(activeAttemptId ?? 0);

  const scenes = useMemo(
    () => (builder ? mapBuilderToScenes(builder, summary) : []),
    [builder, summary]
  );
  const [pendingModel, setPendingModel] = useState<PatientLive2DModel | null>(null);

  const needsModelChoice =
    (!session ||
      session.caseId !== caseItem.id ||
      !session.attemptId ||
      !session.patientModel);

  const patientModel: PatientLive2DModel | null = needsModelChoice
    ? null
    : (session?.patientModel ?? null);
  useEffect(() => {
    if (!simulation || !builder || !session?.patientModel) return;
    if (finishRequestedRef.current && simulation.intento.estado === "EN_PROCESO") {
      return;
    }
    setSession(
      mapSimulationToSession(simulation, builder, session.patientModel, summary)
    );
  }, [builder, session?.patientModel, setSession, simulation, summary]);

  useEffect(() => {
    if (
      !simulation ||
      !builder ||
      !session?.patientModel ||
      !activeAttemptId ||
      simulation.escenaActual ||
      simulation.intento.estado !== "EN_PROCESO" ||
      finishRequestedRef.current
    ) {
      return;
    }

    finishRequestedRef.current = true;
    void finishSimulation.mutateAsync().then(async (finished) => {
      const refreshedSummary = await simulationService.summary(activeAttemptId);
      setSession(
        mapSimulationToSession(
          finished,
          builder,
          session.patientModel,
          refreshedSummary
        )
      );
    });
  }, [
    activeAttemptId,
    builder,
    finishSimulation,
    session?.patientModel,
    setSession,
    simulation,
  ]);

  const backendCurrentScene = useMemo(
    () => scenes.find((s) => s.id === session?.currentSceneId),
    [scenes, session?.currentSceneId]
  );

  const isComplete =
    session?.status === "FINALIZADO" ||
    (!!session?.attemptId &&
      session.caseId === caseItem.id &&
      !session.currentSceneId &&
      !needsModelChoice);

  const currentScene = backendCurrentScene ?? (isComplete ? scenes.at(-1) : undefined);

  const progress = useMemo(() => {
    if (!session || !builder) return 0;
    if (session.status === "FINALIZADO") return 100;
    const decisionCount = session.decisions.length;
    const questionCount = builder.escenas.reduce(
      (total, scene) =>
        total +
        scene.preguntas.filter(({ pregunta }) => pregunta.activo).length,
      0
    );
    return Math.min(
      Math.round((decisionCount / Math.max(questionCount, 1)) * 100),
      100
    );
  }, [builder, session]);

  const emotionalProfile = useMemo(
    () =>
      getEmotionalProfile(session, session?.currentSceneId, caseItem.id),
    [session, caseItem.id]
  );

  const patientPedagogy = useMemo(
    () => buildPatientPedagogy(caseItem, emotionalProfile, currentScene),
    [caseItem, emotionalProfile, currentScene]
  );

  const sessionPhases = useMemo(
    () => buildSessionPhaseTimeline(session, scenes, currentScene, !!isComplete),
    [session, scenes, currentScene, isComplete]
  );

  const clinicalObjective = useMemo(
    () => getCurrentClinicalObjective(caseItem, session, scenes, currentScene, !!isComplete),
    [caseItem, session, scenes, currentScene, isComplete]
  );

  const lastOptionCategory = useMemo(() => {
    if (!session?.decisions.length) return undefined;
    const last = session.decisions[session.decisions.length - 1];
    const scene = scenes.find((s) => s.id === last.sceneId);
    return scene?.options.find((o) => o.id === last.optionId)?.category;
  }, [session, scenes]);

  const patientExpression = useMemo(
    () =>
      patientModel
        ? mapProfileToLive2dExpression(emotionalProfile, patientModel)
        : "Normal",
    [emotionalProfile, patientModel]
  );

  const expressionLabel = useMemo(
    () =>
      patientModel
        ? getLive2dExpressionLabel(patientExpression, patientModel)
        : "",
    [patientExpression, patientModel]
  );

  const psychologistState = useMemo(
    () => categoryToPsychologistState(lastOptionCategory),
    [lastOptionCategory]
  );

  const psychologistStateLabel =
    PSYCHOLOGIST_STATE_LABELS[psychologistState as PsychologistVisualState] ??
    psychologistState;

  const psychologistModelId = useMemo(
    () => (patientModel ? getComplementaryLive2DModel(patientModel) : null),
    [patientModel]
  );

  const psychologistExpression = useMemo(
    () =>
      psychologistModelId
        ? mapPsychologistStateToLive2dExpression(
            psychologistState,
            psychologistModelId
          )
        : "Normal",
    [psychologistState, psychologistModelId]
  );

  const psychologistParticipant = useMemo(
    () =>
      patientModel
        ? buildPsychologistParticipant(patientModel, user, lastOptionCategory)
        : null,
    [patientModel, user, lastOptionCategory]
  );

  const patientParticipant = useMemo(
    () =>
      patientModel
        ? buildPatientParticipant(patientModel, currentScene, expressionLabel)
        : null,
    [patientModel, currentScene, expressionLabel]
  );

  const dialogueTurns = useMemo(
    () =>
      buildClinicalDialogueHistory(
        session,
        scenes,
        currentScene,
        psychologistParticipant?.nombre ?? "Psicólogo",
        caseItem.id
      ),
    [session, scenes, currentScene, psychologistParticipant?.nombre, caseItem.id]
  );

  const lastImpact = useMemo(() => {
    for (let i = dialogueTurns.length - 1; i >= 0; i--) {
      const deltas = dialogueTurns[i].impactDeltas;
      if (deltas?.length) return deltas;
    }
    return undefined;
  }, [dialogueTurns]);

  const sessionLog = useMemo(
    () => buildClinicalSessionLog(dialogueTurns),
    [dialogueTurns]
  );

  const sessionSummary = useMemo(
    () =>
      session && isComplete
        ? buildClinicalSessionSummary(
            caseItem,
            session,
            emotionalProfile
          )
        : null,
    [caseItem, session, isComplete, emotionalProfile]
  );

  const formativeFeedback = useMemo(
    () =>
      session && isComplete
        ? buildFormativeFeedbackPreview(session, emotionalProfile, dialogueTurns)
        : null,
    [session, isComplete, emotionalProfile, dialogueTurns]
  );

  const handleConfirmModel = async () => {
    if (!pendingModel || scenes.length === 0 || !builder) return;
    const started = await startSimulation.mutateAsync({
      casoId: Number(caseItem.id),
      ...(programacionId ? { programacionId: Number(programacionId) } : {}),
    });
    const [createdSimulation, createdSummary] = await Promise.all([
      simulationService.detail(started.intentoId),
      simulationService.summary(started.intentoId),
    ]);
    setSession(
      mapSimulationToSession(
        createdSimulation,
        builder,
        pendingModel,
        createdSummary
      )
    );
  };

  const handleSelect = async (option: DialogueOption) => {
    if (!session?.attemptId || !option.questionId || !builder) return;
    await answerSimulation.mutateAsync({
      preguntaId: Number(option.questionId),
      opcionId: Number(option.id),
    });
    const [updatedSimulation, updatedSummary] = await Promise.all([
      simulationService.detail(session.attemptId),
      simulationService.summary(session.attemptId),
    ]);
    if (
      !updatedSimulation.escenaActual &&
      updatedSimulation.intento.estado === "EN_PROCESO"
    ) {
      const finished = await finishSimulation.mutateAsync();
      const finishedSummary = await simulationService.summary(session.attemptId);
      setSession(
        mapSimulationToSession(
          finished,
          builder,
          session.patientModel,
          finishedSummary
        )
      );
    } else {
      setSession(
        mapSimulationToSession(
          updatedSimulation,
          builder,
          session.patientModel,
          updatedSummary
        )
      );
    }
    setInteractionNonce((n) => n + 1);
  };

  if (isBuilderLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (needsModelChoice) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col justify-center gap-6 px-4 py-12">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link href={`/simulator/${caseItem.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver al caso
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-semibold">{caseItem.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Antes de iniciar la sesión, elige el paciente virtual con el que practicarás.
          </p>
        </div>
        <PatientModelPicker value={pendingModel} onChange={setPendingModel} />
        <Button
          size="lg"
          disabled={!pendingModel}
          onClick={handleConfirmModel}
          className="w-full sm:w-auto"
        >
          Entrar a la entrevista clínica
        </Button>
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Este caso no tiene escenas configuradas todavía.
        </p>
        <Button variant="outline" asChild>
          <Link href="/simulator">Volver al repositorio</Link>
        </Button>
      </div>
    );
  }

  if (!currentScene || !psychologistParticipant || !patientParticipant) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Layout en dos fases: simulación activa vs. resultados
  if (isComplete) {
    return (
      <div className="flex h-full min-h-0 w-full max-w-none flex-col overflow-y-auto bg-background">
        {/* Cabecera en móvil */}
        <ClinicalSessionHeader
          caseTitle={caseItem.title}
          category={caseItem.category}
          progress={100}
          isComplete={true}
          className="shrink-0 lg:hidden"
        />

        {/* Contenedor principal de simulación (fijo mientras se lee) */}
        <div className="flex shrink-0 flex-col min-h-screen lg:grid lg:grid-cols-[18fr_57fr_25fr] lg:min-h-[100vh]">
          {/* Desktop sidebar */}
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

          {/* Centro: conversación + avatar */}
          <div className="flex min-h-0 min-w-0 flex-col border-border/40 lg:border-x">
            <div className="grid min-h-full grid-rows-[minmax(0,40fr)_minmax(0,60fr)] overflow-hidden">
              <ClinicalSessionStage
                psychologist={psychologistParticipant}
                patient={patientParticipant}
                psychologistExpression={psychologistExpression}
                patientExpression={patientExpression}
                therapeuticAlliance={emotionalProfile.therapeuticAlliance}
                clinicalObjective={clinicalObjective.objective}
                clinicalObjectivePhase={clinicalObjective.phaseLabel}
                patientInteractionNonce={interactionNonce}
                className="min-h-0"
              />

              <ClinicalDialoguePanel
                turns={dialogueTurns}
                setting={currentScene.setting}
                sceneTitle={currentScene.title}
                sessionPhases={sessionPhases}
                className="min-h-0"
              />
            </div>
          </div>

          {/* Sidebar derecho (oculto en resultados) */}
          <aside className="hidden min-h-0 min-w-0 flex-col overflow-hidden bg-card/30 lg:flex">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
              <p className="py-6 text-center text-xs text-muted-foreground">
                Sesión finalizada. No hay intervenciones pendientes.
              </p>
            </div>
          </aside>
        </div>

        {/* Banner de completitud + resultados (scroll principal) */}
        <CompletionBanner
          duration={session?.elapsedSeconds ?? 0}
          allianceScore={emotionalProfile.therapeuticAlliance}
        />

        <SimulationResults
          summary={sessionSummary}
          formativeFeedback={formativeFeedback}
          lastImpact={lastImpact}
        />

        {/* CTA footer */}
        <div className="border-t border-border/40 bg-card/30 px-4 py-4 sm:px-6 sm:py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/simulator">
                Volver al repositorio
              </Link>
            </Button>
            <Button
              onClick={() =>
                session?.attemptId
                  ? router.push(`/evaluation/results/${session.attemptId}`)
                  : router.push("/evaluation")
              }
              className="w-full sm:w-auto"
            >
              Ver análisis completo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fase activa: layout original con columnas
  return (
    <div className="flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden">
      {/* Móvil: cabecera compacta */}
      <ClinicalSessionHeader
        caseTitle={caseItem.title}
        category={caseItem.category}
        progress={progress}
        isComplete={false}
        className="shrink-0 lg:hidden"
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[18fr_57fr_25fr]">
        {/* 18% — contexto de sesión */}
        <ClinicalSessionSidebar
          caseTitle={caseItem.title}
          category={caseItem.category}
          progress={progress}
          setting={currentScene.setting}
          supportTools={currentScene.supportTools}
          patientPedagogy={patientPedagogy}
          sessionLog={sessionLog}
          sessionSummary={null}
          formativeFeedback={null}
          className="hidden min-h-0 overflow-y-auto lg:flex"
        />

        {/* 57% — simulación clínica */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-border/40 lg:border-x">
          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,40fr)_minmax(0,53fr)_minmax(0,7fr)] overflow-hidden">
            <ClinicalSessionStage
              psychologist={psychologistParticipant}
              patient={patientParticipant}
              psychologistExpression={psychologistExpression}
              patientExpression={patientExpression}
              therapeuticAlliance={emotionalProfile.therapeuticAlliance}
              clinicalObjective={clinicalObjective.objective}
              clinicalObjectivePhase={clinicalObjective.phaseLabel}
              patientInteractionNonce={interactionNonce}
              className="min-h-0"
            />

            <ClinicalDialoguePanel
              turns={dialogueTurns}
              setting={currentScene.setting}
              sceneTitle={currentScene.title}
              sessionPhases={sessionPhases}
              className="min-h-0"
            />

            <ClinicalSessionFooter
              expressionLabel={expressionLabel}
              psychologistStateLabel={psychologistStateLabel}
              lastImpact={lastImpact}
            />
          </div>
        </div>

        {/* 25% — intervenciones */}
        <aside className="hidden min-h-0 min-w-0 flex-col overflow-hidden bg-card/30 lg:flex">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
            {!isComplete ? (
              <DecisionPanel
                options={currentScene.options}
                onSelect={handleSelect}
                disabled={answerSimulation.isPending || finishSimulation.isPending}
                patientPedagogy={patientPedagogy}
                sessionLog={sessionLog}
              />
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Sesión finalizada. No hay intervenciones pendientes.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Móvil: intervenciones */}
      {!isComplete && (
        <div className="max-h-[38vh] shrink-0 overflow-hidden border-t border-border/40 bg-card/50 p-3 lg:hidden">
          <DecisionPanel
            options={currentScene.options}
            onSelect={handleSelect}
            disabled={answerSimulation.isPending || finishSimulation.isPending}
            patientPedagogy={patientPedagogy}
            sessionLog={sessionLog}
          />
        </div>
      )}
    </div>
  );
}
