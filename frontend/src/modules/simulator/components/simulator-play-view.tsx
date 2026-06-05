"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClinicalSessionHeader } from "@/components/simulator/ClinicalSessionHeader";
import { ClinicalSessionSidebar } from "@/components/simulator/ClinicalSessionSidebar";
import { ClinicalSessionFooter } from "@/components/simulator/ClinicalSessionFooter";
import { DecisionPanel } from "@/modules/simulator/components/decision-panel";
import { useSimulatorStore, useAuthStore } from "@/store";
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
import { ClinicalSessionArtifacts } from "@/components/simulator/ClinicalSessionArtifacts";
import { getComplementaryLive2DModel } from "@/lib/live2d-models";
import { PSYCHOLOGIST_STATE_LABELS } from "@/lib/session-participants";
import {
  buildPatientParticipant,
  buildPsychologistParticipant,
} from "@/lib/session-participants";
import { mockScenes } from "@/mocks";
import { PatientModelPicker } from "@/components/simulator/PatientModelPicker";
import { useCasesCatalogStore } from "@/store/cases-catalog";
import type { DialogueOption, PatientLive2DModel, PsychologistVisualState, SimulationCase } from "@/types";
import { tokens } from "@/styles/tokens";

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
  const user = useAuthStore((s) => s.user);
  const { session, startSession, selectOption } = useSimulatorStore();
  const [interactionNonce, setInteractionNonce] = useState(0);

  const customScenes = useCasesCatalogStore((s) => s.customScenes);
  const scenes = useMemo(
    () => mockScenes[caseItem.id] ?? customScenes[caseItem.id] ?? [],
    [caseItem.id, customScenes]
  );
  const [pendingModel, setPendingModel] = useState<PatientLive2DModel | null>(null);

  const needsModelChoice =
    scenes.length > 0 &&
    (!session ||
      session.caseId !== caseItem.id ||
      !session.patientModel);

  const patientModel: PatientLive2DModel | null = needsModelChoice
    ? null
    : (session?.patientModel ?? null);
  const currentScene = useMemo(
    () => scenes.find((s) => s.id === session?.currentSceneId),
    [scenes, session?.currentSceneId]
  );

  const progress = useMemo(() => {
    if (!session || scenes.length === 0) return 0;
    const decisionCount = session.decisions.length;
    const estimatedTotal = Math.max(scenes.length - 1, 1);
    return Math.min(Math.round((decisionCount / estimatedTotal) * 100), 100);
  }, [session, scenes]);

  const emotionalProfile = useMemo(
    () =>
      getEmotionalProfile(session, session?.currentSceneId, caseItem.id),
    [session, caseItem.id]
  );

  const isComplete = currentScene?.options.length === 0;

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
  }, [session?.decisions, scenes]);

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
            emotionalProfile,
            dialogueTurns,
            scenes
          )
        : null,
    [caseItem, session, isComplete, emotionalProfile, dialogueTurns, scenes]
  );

  const formativeFeedback = useMemo(
    () =>
      session && isComplete
        ? buildFormativeFeedbackPreview(session, emotionalProfile, dialogueTurns)
        : null,
    [session, isComplete, emotionalProfile, dialogueTurns]
  );

  const handleConfirmModel = () => {
    if (!pendingModel || scenes.length === 0) return;
    startSession(caseItem.id, scenes[0].id, pendingModel);
  };

  const handleSelect = (option: DialogueOption) => {
    if (!session) return;
    selectOption(session.currentSceneId, option.id, option.nextSceneId);
    setInteractionNonce((n) => n + 1);
  };

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

  return (
    <div className="flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden">
      {/* Móvil: cabecera compacta */}
      <ClinicalSessionHeader
        caseTitle={caseItem.title}
        category={caseItem.category}
        progress={isComplete ? 100 : progress}
        isComplete={isComplete}
        className="shrink-0 lg:hidden"
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[18fr_57fr_25fr]">
        {/* 18% — contexto de sesión */}
        <ClinicalSessionSidebar
          caseTitle={caseItem.title}
          category={caseItem.category}
          progress={isComplete ? 100 : progress}
          setting={currentScene.setting}
          supportTools={currentScene.supportTools}
          patientPedagogy={patientPedagogy}
          sessionLog={sessionLog}
          sessionSummary={isComplete ? sessionSummary : null}
          formativeFeedback={isComplete ? formativeFeedback : null}
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

            {isComplete ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-0 max-h-[22vh] shrink-0 flex-col gap-2 overflow-y-auto border-t border-success/20 bg-success/[0.04] px-3 py-2"
              >
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <p className="text-xs font-semibold">Sesión completada</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" asChild>
                      <Link href="/simulator">Repositorio</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() => router.push("/evaluation")}
                    >
                      Análisis
                    </Button>
                  </div>
                </div>
                <ClinicalSessionArtifacts
                  summary={sessionSummary}
                  formativeFeedback={formativeFeedback}
                />
              </motion.div>
            ) : (
              <ClinicalSessionFooter
                expressionLabel={expressionLabel}
                psychologistStateLabel={psychologistStateLabel}
                lastImpact={lastImpact}
              />
            )}
          </div>
        </div>

        {/* 25% — intervenciones */}
        <aside className="hidden min-h-0 min-w-0 flex-col overflow-hidden bg-card/30 lg:flex">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
            {!isComplete ? (
              <DecisionPanel
                options={currentScene.options}
                onSelect={handleSelect}
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
            patientPedagogy={patientPedagogy}
            sessionLog={sessionLog}
          />
        </div>
      )}
    </div>
  );
}
