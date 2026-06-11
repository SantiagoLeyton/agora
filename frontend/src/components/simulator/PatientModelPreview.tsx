"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PatientLive2DModel } from "@/types";
import { cn } from "@/lib/utils";

const Live2DPatientAvatar = dynamic(
  () =>
    import("@/components/simulator/Live2DPatientAvatar").then(
      (m) => m.Live2DPatientAvatar
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 animate-pulse bg-muted/50" />
    ),
  }
);

interface PatientModelPreviewProps {
  modelId: PatientLive2DModel;
  className?: string;
  mountDelayMs?: number;
  /** Si false, no inicia Live2D (p. ej. esperar a que el otro avatar termine). */
  enabled?: boolean;
  /**
   * Guarda una imagen fija y desmonta Live2D.
   * Imprescindible para el hombre: si no, desaparece al cargar Haru.
   */
  freezeWhenReady?: boolean;
  onFrozen?: () => void;
}

export function PatientModelPreview({
  modelId,
  className,
  mountDelayMs = 0,
  enabled = true,
  freezeWhenReady = false,
  onFrozen,
}: PatientModelPreviewProps) {
  const [canMount, setCanMount] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [showLive, setShowLive] = useState(true);
  const defaultExpression = modelId === "haru" ? "F01" : "Normal";

  useEffect(() => {
    let timer: number | undefined;
    if (!enabled) {
      timer = window.setTimeout(() => setCanMount(false), 0);
      return () => window.clearTimeout(timer);
    }
    if (mountDelayMs <= 0) {
      timer = window.setTimeout(() => setCanMount(true), 0);
      return () => window.clearTimeout(timer);
    }
    const resetTimer = window.setTimeout(() => setCanMount(false), 0);
    timer = window.setTimeout(() => setCanMount(true), mountDelayMs);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);
    };
  }, [mountDelayMs, enabled]);

  const handleCapture = (dataUrl: string) => {
    setSnapshot(dataUrl);
    setShowLive(false);
    onFrozen?.();
  };

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-muted/15",
        "min-h-[280px]",
        className
      )}
    >
      {snapshot && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={snapshot}
          alt=""
          className="absolute inset-0 h-full w-full object-contain object-center"
        />
      )}

      {canMount && showLive && !snapshot ? (
        <Live2DPatientAvatar
          key={`live-${modelId}`}
          modelId={modelId}
          expression={defaultExpression}
          preview
          onPreviewCapture={freezeWhenReady ? handleCapture : undefined}
          className="absolute inset-0 h-full w-full"
        />
      ) : null}

      {!snapshot && showLive && !canMount && (
        <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-muted-foreground">
          {!enabled
            ? "Esperando vista del paciente hombre…"
            : "Cargando vista previa…"}
        </div>
      )}
    </div>
  );
}
