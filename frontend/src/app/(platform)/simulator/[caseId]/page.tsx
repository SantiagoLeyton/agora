"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useMemo, useState } from "react";
import { ArrowLeft, Clock, Play, Target, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  HeroSection,
  Surface,
  SectionHeader,
  PageLoading,
} from "@/components/design-system";
import { PatientModelPicker } from "@/components/simulator/PatientModelPicker";
import { useCase, useCaseBuilder, useStartSimulation } from "@/hooks/use-data";
import { mapSimulationToSession } from "@/lib/case-adapters";
import { simulationService } from "@/services/simulation-service";
import { useAuthStore, useSimulatorStore } from "@/store";
import type { PatientLive2DModel } from "@/types";

interface CaseDetailPageProps {
  params: Promise<{ caseId: string }>;
}

const difficultyLabels = {
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const programacionIdParam = searchParams.get("programacionId");
  const currentUserId = useAuthStore((state) => state.user?.id);
  const backendRole = useAuthStore((state) => state.user?.backendRole);
  const { data: caseItem, isLoading } = useCase(caseId);
  const programacionId =
    programacionIdParam ??
    (caseItem?.programacionActivaId ? String(caseItem.programacionActivaId) : null);
  const canPresent =
    backendRole !== "ESTUDIANTE" || caseItem?.presentable === true || Boolean(programacionIdParam);
  const presentationMessage =
    caseItem?.mensajePresentacion ??
    "Este caso aún no tiene una programación activa para presentación.";
  const { data: builder, isLoading: isBuilderLoading } = useCaseBuilder(caseId);
  const session = useSimulatorStore((s) => s.session);
  const setSession = useSimulatorStore((s) => s.setSession);
  const startSimulation = useStartSimulation();

  const firstSceneId = useMemo(() => {
    return builder?.escenas.find(({ escena }) => escena.activo)?.escena.id;
  }, [builder]);

  const canContinue =
    session?.caseId === caseId &&
    session.ownerUserId === currentUserId &&
    !!session.patientModel &&
    !!session.attemptId &&
    session.status === "EN_PROCESO";

  const [selectedModel, setSelectedModel] = useState<PatientLive2DModel | null>(
    caseItem?.patientModel ?? null
  );

  const handleStart = async () => {
    if (!selectedModel || !firstSceneId || !builder) return;
    const started = await startSimulation.mutateAsync({
      casoId: Number(caseId),
      ...(programacionId ? { programacionId: Number(programacionId) } : {}),
    });
    const [simulation, summary] = await Promise.all([
      simulationService.detail(started.intentoId),
      simulationService.summary(started.intentoId),
    ]);
    setSession(
      mapSimulationToSession(
        simulation,
        builder,
        selectedModel,
        summary,
        currentUserId ?? undefined,
        programacionId ? Number(programacionId) : undefined
      )
    );
    const playUrl = programacionId
      ? `/simulator/${caseId}/play?programacionId=${programacionId}`
      : `/simulator/${caseId}/play`;
    router.push(playUrl);
  };

  if (isLoading || isBuilderLoading) return <PageLoading />;

  if (!caseItem) {
    return (
      <Surface variant="muted" className="py-16 text-center text-muted-foreground">
        Caso no encontrado
      </Surface>
    );
  }

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/simulator">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
      </Button>

      <HeroSection
        eyebrow="Expediente clínico"
        title={caseItem.title}
        description={caseItem.description}
        action={
          canContinue ? (
            <Button asChild size="lg">
              <Link
                href={
                  programacionId
                    ? `/simulator/${caseId}/play?programacionId=${programacionId}`
                    : `/simulator/${caseId}/play`
                }
              >
                <Play className="h-4 w-4" />
                Continuar simulación
              </Link>
            </Button>
          ) : canPresent ? (
            <Button
              size="lg"
              disabled={!selectedModel || !firstSceneId || startSimulation.isPending}
              onClick={handleStart}
            >
              <Play className="h-4 w-4" />
              Presentar caso
            </Button>
          ) : (
            <Surface variant="muted" className="px-4 py-3 text-sm text-muted-foreground">
              {presentationMessage}
            </Surface>
          )
        }
        aside={
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/60 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Categoría clínica</p>
              <p className="font-medium">{caseItem.category}</p>
            </div>
          </div>
        }
      />

      {!canContinue && canPresent && (
        <Surface className="p-6">
          <SectionHeader
            title="Paciente virtual"
            description="Selecciona el avatar antes de entrar a la sesión clínica."
          />
          <PatientModelPicker
            className="mt-4"
            value={selectedModel}
            onChange={setSelectedModel}
          />
          {!firstSceneId && (
            <p className="mt-4 text-sm text-destructive">
              Este caso no tiene escenas configuradas.
            </p>
          )}
        </Surface>
      )}

      {!canContinue && !canPresent && (
        <Surface variant="muted" className="p-6 text-sm text-muted-foreground">
          {presentationMessage}
        </Surface>
      )}

      {canContinue && session?.patientModel && (
        <Surface variant="muted" className="px-4 py-3 text-sm text-muted-foreground">
          Sesión en curso con avatar{" "}
          <span className="font-medium text-foreground">
            {session.patientModel === "haru" ? "mujer" : "hombre"}
          </span>
          . Puedes continuar o reiniciar eligiendo otro avatar abajo.
        </Surface>
      )}

      {canContinue && (
        <Surface className="p-6">
          <SectionHeader title="Reiniciar con otro avatar" />
          <PatientModelPicker
            className="mt-4"
            value={selectedModel}
            onChange={setSelectedModel}
          />
          <Button
            className="mt-4"
            variant="outline"
            disabled={!selectedModel || !firstSceneId || startSimulation.isPending}
            onClick={handleStart}
          >
            Reiniciar simulación
          </Button>
        </Surface>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Surface className="lg:col-span-2">
          <SectionHeader title="Objetivos de aprendizaje" />
          <ul className="mt-4 space-y-3">
            {caseItem.learningObjectives.map((obj) => (
              <li key={obj} className="flex items-start gap-3 text-sm">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface>
          <SectionHeader title="Ficha del caso" />
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Dificultad</dt>
              <dd>
                <Badge
                  variant={
                    caseItem.difficulty === "advanced"
                      ? "destructive"
                      : caseItem.difficulty === "intermediate"
                        ? "warning"
                        : "success"
                  }
                >
                  {difficultyLabels[caseItem.difficulty]}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Duración</dt>
              <dd className="flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {caseItem.durationMinutes} min
              </dd>
            </div>
            {caseItem.progress > 0 && (
              <div>
                <div className="mb-2 flex justify-between">
                  <dt className="text-muted-foreground">Progreso</dt>
                  <dd className="font-medium tabular-nums">{caseItem.progress}%</dd>
                </div>
                <Progress value={caseItem.progress} className="h-2" />
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/50 pt-4">
            {caseItem.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}
