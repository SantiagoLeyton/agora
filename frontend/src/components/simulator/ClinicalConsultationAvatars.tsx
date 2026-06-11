"use client";

import { useEffect, useRef, useState } from "react";
import {
  applyLive2dExpression,
  bindLive2dExpressionOnMotionFinish,
} from "@/lib/live2d-expressions";
import { layoutLive2dConsultationSlot } from "@/lib/live2d-patient-layout";
import { getLive2DModelConfig } from "@/lib/live2d-models";
import {
  ensureLive2DRuntime,
  enqueueLive2DModelLoad,
  registerLive2DGlobalTicker,
} from "@/lib/live2d-runtime";
import type { PatientLive2DModel } from "@/types";
import { cn } from "@/lib/utils";

const INIT_TIMEOUT_MS = 25_000;

interface ClinicalConsultationAvatarsProps {
  psychologistModelId: PatientLive2DModel;
  patientModelId: PatientLive2DModel;
  psychologistExpression: string;
  patientExpression: string;
  interactionNonce?: number;
  className?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout (${label}) tras ${ms / 1000}s`)), ms)
    ),
  ]);
}

/**
 * Un solo canvas Live2D con psicólogo y paciente — evita contenedores vacíos
 * por conflicto entre dos instancias WebGL.
 */
export function ClinicalConsultationAvatars({
  psychologistModelId,
  patientModelId,
  psychologistExpression,
  patientExpression,
  interactionNonce = 0,
  className,
}: ClinicalConsultationAvatarsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const psychModelRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientModelRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mountGenRef = useRef(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const psychConfig = getLive2DModelConfig(psychologistModelId);
  const patientConfig = getLive2DModelConfig(patientModelId);

  const layoutBoth = () => {
    const host = hostRef.current;
    const app = appRef.current;
    if (!host || !app) return;

    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w < 8 || h < 8) return;

    app.renderer.resize(w, h);

    if (psychModelRef.current) {
      layoutLive2dConsultationSlot(
        psychModelRef.current,
        w,
        h,
        psychologistModelId,
        "psychologist",
        "right"
      );
    }
    if (patientModelRef.current) {
      layoutLive2dConsultationSlot(
        patientModelRef.current,
        w,
        h,
        patientModelId,
        "patient",
        "left"
      );
    }
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const mountGen = ++mountGenRef.current;
    let cancelled = false;

    const init = async () => {
      try {
        setStatus("loading");

        const { PIXI, Live2DModel, config: live2dRuntimeConfig } =
          await withTimeout(ensureLive2DRuntime(), INIT_TIMEOUT_MS, "runtime");
        if (cancelled || mountGen !== mountGenRef.current) return;

        live2dRuntimeConfig.expressionFadingDuration = 280;

        let width = host.clientWidth;
        let height = host.clientHeight;
        if (width < 8 || height < 8) {
          width = 640;
          height = 160;
        }

        const app = new PIXI.Application({
          backgroundAlpha: 0,
          width,
          height,
          antialias: true,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoStart: true,
        });

        const canvas = app.view as HTMLCanvasElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        host.replaceChildren();
        host.appendChild(canvas);
        appRef.current = app;

        registerLive2DGlobalTicker(PIXI, Live2DModel);

        const psychModel = await enqueueLive2DModelLoad(() =>
          withTimeout(
            Live2DModel.from(psychConfig.modelUrl, { autoInteract: false }),
            INIT_TIMEOUT_MS,
            "psicólogo"
          )
        );
        if (cancelled || mountGen !== mountGenRef.current) {
          psychModel.destroy();
          app.destroy(true, { children: true });
          return;
        }

        const patientModel = await enqueueLive2DModelLoad(() =>
          withTimeout(
            Live2DModel.from(patientConfig.modelUrl, { autoInteract: true }),
            INIT_TIMEOUT_MS,
            "paciente"
          )
        );
        if (cancelled || mountGen !== mountGenRef.current) {
          psychModel.destroy();
          patientModel.destroy();
          app.destroy(true, { children: true });
          return;
        }

        psychModel.autoUpdate = true;
        patientModel.autoUpdate = true;

        app.stage.addChild(psychModel);
        app.stage.addChild(patientModel);
        psychModelRef.current = psychModel;
        patientModelRef.current = patientModel;

        try {
          psychModel.motion(psychConfig.idleMotion);
          patientModel.motion(patientConfig.idleMotion);
        } catch {
          // ignore
        }

        applyLive2dExpression(psychModel, psychologistExpression, psychologistModelId);
        applyLive2dExpression(patientModel, patientExpression, patientModelId);

        layoutBoth();
        resizeObserverRef.current = new ResizeObserver(layoutBoth);
        resizeObserverRef.current.observe(host);

        if (!cancelled && mountGen === mountGenRef.current) {
          setStatus("ready");
        }
      } catch {
        if (!cancelled && mountGen === mountGenRef.current) {
          setStatus("error");
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
      resizeObserverRef.current?.disconnect();
      try {
        psychModelRef.current?.destroy?.();
        patientModelRef.current?.destroy?.();
        appRef.current?.destroy?.(true, { children: true });
      } catch {
        // ignore
      }
      psychModelRef.current = null;
      patientModelRef.current = null;
      appRef.current = null;
      host.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [psychologistModelId, patientModelId]);

  useEffect(() => {
    const psych = psychModelRef.current;
    const patient = patientModelRef.current;
    if (status !== "ready") return;
    if (psych) applyLive2dExpression(psych, psychologistExpression, psychologistModelId);
    if (patient) applyLive2dExpression(patient, patientExpression, patientModelId);
  }, [
    status,
    psychologistExpression,
    patientExpression,
    psychologistModelId,
    patientModelId,
  ]);

  useEffect(() => {
    const patient = patientModelRef.current;
    if (status !== "ready" || !patient || interactionNonce === 0) return;
    try {
      patient.motion(patientConfig.tapMotion);
    } catch {
      // ignore
    }
    const timer = window.setTimeout(() => {
      if (patientModelRef.current) {
        applyLive2dExpression(
          patientModelRef.current,
          patientExpression,
          patientModelId
        );
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [status, interactionNonce, patientConfig.tapMotion, patientExpression, patientModelId]);

  useEffect(() => {
    const psych = psychModelRef.current;
    const patient = patientModelRef.current;
    if (status !== "ready" || !psych || !patient) return;

    const unbindPsych = bindLive2dExpressionOnMotionFinish(
      psych,
      () => psychologistExpression,
      psychologistModelId
    );
    const unbindPatient = bindLive2dExpressionOnMotionFinish(
      patient,
      () => patientExpression,
      patientModelId
    );
    return () => {
      unbindPsych();
      unbindPatient();
    };
  }, [
    status,
    psychologistExpression,
    patientExpression,
    psychologistModelId,
    patientModelId,
  ]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-visible bg-transparent",
        className
      )}
    >
      <div
        ref={hostRef}
        className="h-full min-h-[140px] w-full md:min-h-[160px]"
      />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 text-[10px] text-muted-foreground">
          Cargando presencia clínica…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 text-[10px] text-destructive">
          No se pudo cargar la consulta visual
        </div>
      )}
    </div>
  );
}
