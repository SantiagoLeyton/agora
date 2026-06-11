"use client";

import { useEffect, useRef, useState } from "react";
import {
  applyLive2dExpression,
  bindLive2dExpressionOnMotionFinish,
} from "@/lib/live2d-expressions";
import { layoutLive2dParticipant } from "@/lib/live2d-patient-layout";
import { getLive2DModelConfig } from "@/lib/live2d-models";
import {
  ensureLive2DRuntime,
  enqueueLive2DModelLoad,
  registerLive2DGlobalTicker,
} from "@/lib/live2d-runtime";
import type { Live2DParticipantRole, PatientLive2DModel } from "@/types";
import { cn } from "@/lib/utils";

const INIT_TIMEOUT_MS = 25_000;

export interface Live2DParticipantAvatarProps {
  className?: string;
  modelId?: PatientLive2DModel;
  /** Paciente (protagonista) o psicólogo (estudiante) — misma infra Live2D */
  participantRole?: Live2DParticipantRole;
  motionGroup?: string;
  expression?: string;
  interactionNonce?: number;
  /** Vista compacta para selector de paciente */
  preview?: boolean;
  /** Encuadre compacto en escena dual de sesión */
  sessionCompact?: boolean;
  /** Consulta bilateral: orientación hacia el interlocutor */
  faceToward?: "left" | "right";
  /** Retrasa montaje (p. ej. psicólogo tras cargar paciente) */
  enabled?: boolean;
  onReady?: () => void;
  /** Captura el canvas y libera Live2D (evita que el 2.º modelo lo borre) */
  onPreviewCapture?: (dataUrl: string) => void;
}

/** @deprecated Alias — usar Live2DParticipantAvatarProps */
export type Live2DPatientAvatarProps = Live2DParticipantAvatarProps;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout (${label}) tras ${ms / 1000}s`)), ms)
    ),
  ]);
}

export function Live2DParticipantAvatar({
  className,
  modelId = "natori",
  participantRole = "patient",
  motionGroup,
  expression,
  interactionNonce = 0,
  preview = false,
  sessionCompact = false,
  faceToward,
  enabled = true,
  onReady,
  onPreviewCapture,
}: Live2DParticipantAvatarProps) {
  const modelConfig = getLive2DModelConfig(modelId);
  const resolvedMotion = motionGroup ?? modelConfig.idleMotion;
  const resolvedExpression =
    expression ?? (modelId === "haru" ? "F01" : "Normal");
  const hostRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const tickerCallbackRef = useRef<(() => void) | null>(null);
  const captureDoneRef = useRef(false);
  const mountGenRef = useRef(0);
  const [modelReady, setModelReady] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) {
      setModelReady(false);
      setStatus("loading");
      return;
    }

    const mountGen = ++mountGenRef.current;
    let cancelled = false;

    const layoutModel = () => {
      const model = modelRef.current;
      const app = appRef.current;
      if (!model || !app || !host) return;

      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w < 8 || h < 8) return;

      app.renderer.resize(w, h);
      layoutLive2dParticipant(model, w, h, modelId, {
        preview,
        participantRole,
        faceToward,
      });
    };

    const init = async () => {
      try {
        setStatus("loading");
        setErrorMessage(null);

        const { PIXI, Live2DModel, config: live2dRuntimeConfig } =
          await withTimeout(
            ensureLive2DRuntime(),
            INIT_TIMEOUT_MS,
            "runtime Live2D"
          );
        if (cancelled || mountGen !== mountGenRef.current) return;

        live2dRuntimeConfig.expressionFadingDuration = 280;

        let width = host.clientWidth;
        let height = host.clientHeight;
        if (width < 8 || height < 8) {
          await new Promise<void>((resolve) => {
            const started = Date.now();
            const waitSize = () => {
              if (cancelled || mountGen !== mountGenRef.current) return;
              width = host.clientWidth;
              height = host.clientHeight;
              if (width >= 8 && height >= 8) {
                resolve();
                return;
              }
              if (Date.now() - started > 5000) {
                width = preview ? 300 : 360;
                height = preview ? 400 : 420;
                resolve();
                return;
              }
              requestAnimationFrame(waitSize);
            };
            waitSize();
          });
        }

        if (cancelled || mountGen !== mountGenRef.current) return;

        if (preview && (width < 8 || height < 8)) {
          width = 300;
          height = 400;
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

        const model = await enqueueLive2DModelLoad(() =>
          withTimeout(
            Live2DModel.from(modelConfig.modelUrl, {
              autoInteract: !preview,
            }),
            INIT_TIMEOUT_MS,
            `modelo ${modelConfig.label}`
          )
        );

        if (cancelled || mountGen !== mountGenRef.current) {
          model.destroy();
          app.destroy(true, { children: true });
          return;
        }

        app.stage.addChild(model);
        modelRef.current = model;

        if (preview) {
          // Selector: ticker local (convive con snapshot del otro avatar)
          model.autoUpdate = false;
          const onTick = () => {
            if (modelRef.current && appRef.current) {
              modelRef.current.update(appRef.current.ticker.deltaTime);
            }
          };
          tickerCallbackRef.current = onTick;
          app.ticker.add(onTick);
        } else {
          registerLive2DGlobalTicker(PIXI, Live2DModel);
          model.autoUpdate = true;
        }

        try {
          if (resolvedMotion) model.motion(resolvedMotion);
        } catch {
          // motion opcional
        }
        applyLive2dExpression(model, resolvedExpression, modelId);

        layoutModel();

        resizeObserverRef.current = new ResizeObserver(layoutModel);
        resizeObserverRef.current.observe(host);

        if (!cancelled && mountGen === mountGenRef.current) {
          setModelReady(true);
          setStatus("ready");
          onReady?.();
          requestAnimationFrame(() => {
            layoutModel();
            requestAnimationFrame(() => {
              layoutModel();
              if (
                preview &&
                onPreviewCapture &&
                !captureDoneRef.current &&
                appRef.current?.view
              ) {
                captureDoneRef.current = true;
                const canvas = appRef.current.view as HTMLCanvasElement;
                try {
                  onPreviewCapture(canvas.toDataURL("image/png"));
                } catch {
                  // ignore capture errors
                }
              }
            });
          });
        }
      } catch (err) {
        if (!cancelled && mountGen === mountGenRef.current) {
          const message = err instanceof Error ? err.message : String(err);
          setStatus("error");
          setErrorMessage(message);
          console.error("[Live2DPatientAvatar]", err);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      const app = appRef.current;
      const onTick = tickerCallbackRef.current;
      if (app && onTick) {
        app.ticker.remove(onTick);
      }
      tickerCallbackRef.current = null;
      try {
        modelRef.current?.destroy?.();
        app?.destroy?.(true, { children: true });
      } catch {
        // ignore
      }
      modelRef.current = null;
      appRef.current = null;
      setModelReady(false);
      host.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, participantRole, enabled]);

  useEffect(() => {
    const model = modelRef.current;
    if (!modelReady || !model) return;
    applyLive2dExpression(model, resolvedExpression, modelId);
    const id = requestAnimationFrame(() =>
      applyLive2dExpression(model, resolvedExpression, modelId)
    );
    return () => cancelAnimationFrame(id);
  }, [modelReady, resolvedExpression, modelId]);

  useEffect(() => {
    const model = modelRef.current;
    if (!modelReady || !model) return;
    return bindLive2dExpressionOnMotionFinish(
      model,
      () => resolvedExpression,
      modelId
    );
  }, [modelReady, modelId, resolvedExpression]);

  useEffect(() => {
    const model = modelRef.current;
    if (!modelReady || !model || interactionNonce === 0) return;
    try {
      model.motion(modelConfig.tapMotion);
    } catch {
      // ignore
    }
    const timer = window.setTimeout(() => {
      if (modelRef.current) {
        applyLive2dExpression(
          modelRef.current,
          resolvedExpression,
          modelId
        );
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [modelReady, interactionNonce, modelConfig.tapMotion, resolvedExpression, modelId]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/30",
        preview
          ? "h-full rounded-none border-0 bg-transparent shadow-none ring-0"
          : sessionCompact
            ? "rounded-2xl border border-border/50 shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--surface-ring))]"
            : "rounded-3xl border border-border/60 shadow-[var(--shadow-elevated)] ring-1 ring-[hsl(var(--surface-ring))]",
        className
      )}
    >
      <div
        ref={hostRef}
        className={cn(
          preview
            ? "h-full w-full min-h-[280px]"
            : sessionCompact
              ? "h-[200px] w-full min-h-[180px] sm:h-[220px]"
              : "h-[min(420px,55vh)] w-full min-h-[320px]",
          status === "ready" && "relative z-[1]"
        )}
      />
      {status === "loading" && (
        <div className="absolute inset-0 z-[2] grid place-items-center bg-card/70 text-xs text-muted-foreground">
          {preview
            ? "Cargando vista previa…"
            : participantRole === "psychologist"
              ? "Cargando psicólogo…"
              : "Cargando paciente…"}
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-[2] grid place-items-center bg-card/95 p-4 text-center">
          <p className="text-sm font-medium text-destructive">Avatar Live2D</p>
          <p className="mt-2 max-w-xs text-xs text-muted-foreground">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

/** Alias retrocompatible */
export const Live2DPatientAvatar = Live2DParticipantAvatar;
