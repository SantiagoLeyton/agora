"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRive } from "@rive-app/react-canvas";
import { motion } from "framer-motion";
import {
  inputTypeLabel,
  isBooleanInput,
  isTriggerInput,
  resolveAnimationCue,
  type PatientEmotionKey,
  type PatientEmotions,
} from "@/lib/rive-patient-cues";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";

interface ClinicalAvatarProps {
  className?: string;
  animation?: string | string[];
  stateMachine?: string;
  emotions?: PatientEmotions;
  /** Log + on-screen list of animations, state machines and inputs (no Rive Editor needed). */
  debug?: boolean;
}

function normalizePercent(v: number | undefined): number {
  if (typeof v !== "number" || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function pickStateMachineName(rive: unknown, preferred?: string): string | undefined {
  if (preferred) return preferred;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const names: string[] | undefined = (rive as any)?.stateMachineNames;
    return names?.[0];
  } catch {
    return undefined;
  }
}

function safeGetAnimationNames(rive: unknown): string[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const names: string[] | undefined = (rive as any)?.animationNames;
    return names ?? [];
  } catch {
    return [];
  }
}

function safeGetInputs(rive: unknown, stateMachineName?: string) {
  if (!stateMachineName) return [] as unknown[];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = (rive as any)?.stateMachineInputs;
    if (typeof fn !== "function") return [];
    return fn.call(rive, stateMachineName) ?? [];
  } catch {
    return [];
  }
}

function setInputValue(input: unknown, value: number | boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyInput = input as any;
  if (!anyInput) return;
  if ("value" in anyInput) {
    anyInput.value = value;
  }
}

function fireTrigger(input: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyInput = input as any;
  if (typeof anyInput?.fire === "function") {
    anyInput.fire();
  }
}

const EMOTION_INPUT_PATTERNS: Array<[PatientEmotionKey, RegExp[]]> = [
  ["anxiety", [/anxiety/i, /ansiedad/i, /stress/i, /blush/i]],
  ["therapeuticAlliance", [/trust/i, /alliance/i, /alianza/i, /rapport/i, /smile/i]],
  ["riskLevel", [/risk/i, /riesgo/i, /danger/i]],
  ["emotionalTension", [/tension/i, /tensión/i, /arousal/i]],
  ["stability", [/stability/i, /stable/i, /estabilidad/i, /calm/i, /calma/i, /bop/i]],
];

export function ClinicalAvatar({
  className,
  animation,
  stateMachine,
  emotions,
  debug = false,
}: ClinicalAvatarProps) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [riveInstance, setRiveInstance] = useState<any>(null);
  const [activeSM, setActiveSM] = useState<string | undefined>(stateMachine);
  const [debugAnimations, setDebugAnimations] = useState<string[]>([]);
  const [debugInputs, setDebugInputs] = useState<
    Array<{ name?: string; type?: string; value?: unknown }>
  >([]);
  const [activeCue, setActiveCue] = useState<string | null>(null);
  const lastAnimationCue = useRef<string | null>(null);

  const animations = useMemo(() => {
    if (!animation) return undefined;
    return Array.isArray(animation) ? animation : [animation];
  }, [animation]);

  const refreshDiscovery = (rive: unknown, sm?: string) => {
    const animationNames = safeGetAnimationNames(rive);
    setDebugAnimations(animationNames);
    if (sm) {
      const inputs = safeGetInputs(rive, sm);
      setDebugInputs(
        inputs.map((i: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const input = i as any;
          return {
            name: input?.name,
            type: inputTypeLabel(input?.type),
            value: input?.value,
          };
        })
      );
    }
    return animationNames;
  };

  const { RiveComponent } = useRive({
    src: "/rive/patient.riv",
    autoplay: true,
    ...(stateMachine ? { stateMachines: stateMachine } : {}),
    ...(animations ? { animations } : {}),
    onRiveReady: (rive) => {
      setLoadError(null);
      setReady(true);
      setRiveInstance(rive);
      const sm = pickStateMachineName(rive, stateMachine);
      setActiveSM(sm);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rive as any)?.play?.(sm ? [sm] : undefined);
      } catch {
        // ignore
      }

      const animationNames = refreshDiscovery(rive, sm);

      if (debug) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const smNames = (rive as any)?.stateMachineNames as string[] | undefined;
        // eslint-disable-next-line no-console
        console.log("[ClinicalAvatar] discovery", {
          stateMachineNames: smNames,
          animationNames,
          activeSM: sm,
          inputs: sm ? safeGetInputs(rive, sm) : [],
        });
      }
    },
  });

  useEffect(() => {
    if (!debug || !riveInstance) return;
    const id = setTimeout(() => refreshDiscovery(riveInstance, activeSM), 250);
    return () => clearTimeout(id);
  }, [debug, riveInstance, activeSM]);

  // 1) Numeric/boolean SM inputs (if the downloaded file exposes any).
  // 2) Triggers on threshold (e.g. Blush).
  // 3) Fallback: play a matching animation by name (Head Bop, Smile, …).
  useEffect(() => {
    if (!riveInstance || !emotions) return;

    const sm = activeSM ?? pickStateMachineName(riveInstance, stateMachine);
    const animationNames = safeGetAnimationNames(riveInstance);
    const inputs = sm ? safeGetInputs(riveInstance, sm) : [];

    if (debug) refreshDiscovery(riveInstance, sm);

    let appliedInput = false;

    if (inputs.length > 0 && sm) {
      for (const [emotionKey, patterns] of EMOTION_INPUT_PATTERNS) {
        const raw = emotions[emotionKey];
        if (typeof raw !== "number") continue;
        const value = normalizePercent(raw);

        for (const input of inputs) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const typed = input as any;
          const name = (typed?.name as string | undefined) ?? "";
          if (!name || !patterns.some((p) => p.test(name))) continue;

          const type = typed?.type;
          if (isTriggerInput(type)) {
            if (value >= 62) {
              fireTrigger(input);
              setActiveCue(`trigger:${name}`);
              appliedInput = true;
            }
          } else if (isBooleanInput(type)) {
            setInputValue(input, value >= 50);
            appliedInput = true;
          } else {
            const normalized = /norm|01|0_1|ratio|pct01/i.test(name);
            setInputValue(input, normalized ? value / 100 : value);
            appliedInput = true;
          }
        }
      }
    }

    if (appliedInput) return;

    const cue = resolveAnimationCue(animationNames, emotions);
    if (!cue || cue === lastAnimationCue.current) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (riveInstance as any)?.play?.(cue);
      lastAnimationCue.current = cue;
      setActiveCue(`animation:${cue}`);
    } catch {
      // ignore
    }
  }, [riveInstance, activeSM, stateMachine, emotions, debug]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60",
        "bg-gradient-to-br from-card via-card to-muted/35",
        "shadow-[var(--shadow-elevated)] ring-1 ring-[hsl(var(--surface-ring))]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_30%,hsl(var(--primary)/0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/[0.10] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-info/[0.08] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: tokens.motion.base, ease: tokens.motion.easeOut }}
        className="relative aspect-[4/5] w-full min-h-[420px]"
      >
        <div className="absolute inset-0">
          <RiveComponent className="h-full w-full" />
        </div>
        {!ready && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 shadow-[var(--shadow-sm)]" />
            <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-primary/60 border-t-transparent" />
            <p className="absolute bottom-6 max-w-[18rem] px-4 text-center text-xs text-muted-foreground">
              {loadError ?? "Cargando paciente virtual..."}
            </p>
          </div>
        )}
        {debug && (
          <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] rounded-xl border border-border/50 bg-card/90 p-2 text-[10px] text-muted-foreground shadow-[var(--shadow-sm)] backdrop-blur">
            <p className="font-semibold text-foreground">Rive (solo lectura)</p>
            <p className="mt-0.5 text-[9px] leading-snug">
              Archivo descargado: no hace falta el editor. Esto es lo que expone el .riv en runtime.
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">State Machine:</span>{" "}
              <span className="font-mono text-foreground">{activeSM ?? "—"}</span>
            </p>
            {activeCue && (
              <p className="mt-0.5">
                <span className="text-muted-foreground">Cue activo:</span>{" "}
                <span className="font-mono text-foreground">{activeCue}</span>
              </p>
            )}
            {debugAnimations.length > 0 && (
              <div className="mt-1.5 max-h-20 overflow-auto rounded-lg border border-border/40 bg-muted/30 p-2">
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Animaciones
                </p>
                <ul className="space-y-0.5 font-mono text-[10px] text-foreground/90">
                  {debugAnimations.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
            {debugInputs.length > 0 ? (
              <div className="mt-1.5 max-h-20 overflow-auto rounded-lg border border-border/40 bg-muted/30 p-2">
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Inputs SM
                </p>
                <ul className="space-y-0.5">
                  {debugInputs.map((i, idx) => (
                    <li key={`${i.name ?? "input"}-${idx}`} className="font-mono text-[10px] text-foreground/90">
                      {i.name ?? "?"} <span className="text-muted-foreground">({i.type})</span>
                      {typeof i.value !== "undefined" && (
                        <span className="text-muted-foreground"> = {String(i.value)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-1.5 rounded-lg border border-dashed border-border/50 bg-muted/20 px-2 py-1.5 text-[9px] leading-snug">
                Sin inputs en la state machine → las emociones se mapean por nombre de animación
                (Blush, Smile, Head Bop, …).
              </p>
            )}
          </div>
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/60 to-transparent" />
    </div>
  );
}
