"use client";

import { useState } from "react";
import { User, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { LIVE2D_MODELS } from "@/lib/live2d-models";
import { PatientModelPreview } from "@/components/simulator/PatientModelPreview";
import type { PatientLive2DModel } from "@/types";

interface PatientModelPickerProps {
  value: PatientLive2DModel | null;
  onChange: (model: PatientLive2DModel) => void;
  className?: string;
}

export function PatientModelPicker({
  value,
  onChange,
  className,
}: PatientModelPickerProps) {
  /** La mujer solo carga Live2D cuando el hombre ya quedó fijado como imagen */
  const [natoriFrozen, setNatoriFrozen] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-sm text-muted-foreground">
        Compara ambos pacientes (torso hacia arriba) y elige con cuál practicar:
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Hombre: captura a imagen para que no desaparezca al cargar Haru */}
        <button
          type="button"
          onClick={() => onChange("natori")}
          className={cn(
            "flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-all",
            "hover:border-primary/40 hover:bg-primary/5",
            value === "natori"
              ? "border-primary bg-primary/10 ring-2 ring-primary/25"
              : "border-border/60 bg-card/80"
          )}
        >
          <div
            className="pointer-events-none w-full border-b border-border/40"
            aria-hidden
          >
            <PatientModelPreview
              modelId="natori"
              freezeWhenReady
              onFrozen={() => setNatoriFrozen(true)}
            />
          </div>
          <PreviewLabel
            selected={value === "natori"}
            title="Paciente hombre"
            description="Avatar masculino"
            icon={User}
            modelId="natori"
          />
        </button>

        {/* Mujer: Live2D en vivo, solo tras fijar al hombre */}
        <button
          type="button"
          onClick={() => onChange("haru")}
          className={cn(
            "flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-all",
            "hover:border-primary/40 hover:bg-primary/5",
            value === "haru"
              ? "border-primary bg-primary/10 ring-2 ring-primary/25"
              : "border-border/60 bg-card/80"
          )}
        >
          <div
            className="pointer-events-none w-full border-b border-border/40"
            aria-hidden
          >
            <PatientModelPreview
              modelId="haru"
              enabled={natoriFrozen}
              mountDelayMs={300}
            />
          </div>
          <PreviewLabel
            selected={value === "haru"}
            title="Paciente mujer"
            description="Avatar femenino"
            icon={UserRound}
            modelId="haru"
          />
        </button>
      </div>

      {value ? (
        <p className="text-center text-xs text-muted-foreground">
          Seleccionado:{" "}
          <span className="font-medium text-foreground">
            {value === "haru" ? "Paciente mujer" : "Paciente hombre"}
          </span>
        </p>
      ) : (
        <p className="text-center text-xs text-amber-600 dark:text-amber-400">
          Selecciona un paciente para continuar
        </p>
      )}
    </div>
  );
}

function PreviewLabel({
  selected,
  title,
  description,
  icon: Icon,
  modelId,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: typeof User;
  modelId: PatientLive2DModel;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {LIVE2D_MODELS[modelId].label}
        </p>
      </div>
    </div>
  );
}
