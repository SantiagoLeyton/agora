"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { Surface } from "@/components/design-system";
import type { ConsequenceDetailResponse } from "@/types/simulation";

interface ConsequenceBannerProps {
  consequence: ConsequenceDetailResponse | null;
  onDismiss?: () => void;
}

export function ConsequenceBanner({ consequence, onDismiss }: ConsequenceBannerProps) {
  return (
    <AnimatePresence>
      {consequence && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="pointer-events-auto fixed inset-x-4 bottom-24 z-40 mx-auto max-w-2xl lg:bottom-8 lg:left-auto lg:right-8 lg:max-w-md"
        >
          <Surface className="border-primary/30 bg-card/95 p-4 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Consecuencia de la decisión
                </p>
                <p className="mt-1 text-sm font-medium leading-snug">
                  {consequence.mensaje ?? "La decisión produce un cambio clínico observable."}
                </p>
              </div>
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cerrar
                </button>
              )}
            </div>
            {consequence.descripcion && (
              <p className="text-sm text-muted-foreground">{consequence.descripcion}</p>
            )}
            {consequence.observacionPedagogica && (
              <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {consequence.observacionPedagogica}
              </p>
            )}
            {consequence.impactos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {consequence.impactos.map((impacto) => (
                  <span
                    key={`${impacto.estado}-${impacto.variacion}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px]"
                  >
                    {impacto.variacion >= 0 ? (
                      <ArrowUp className="h-3 w-3 text-success" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-destructive" />
                    )}
                    {impacto.estado}{" "}
                    {impacto.valorAnterior != null && impacto.valorActual != null
                      ? `${impacto.valorAnterior}→${impacto.valorActual}`
                      : `${impacto.variacion >= 0 ? "+" : ""}${impacto.variacion}`}
                  </span>
                ))}
              </div>
            )}
            {!consequence.mensaje && !consequence.descripcion && (
              <p className="mt-2 flex items-center gap-2 text-xs text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                Esta opción no tiene consecuencia clínica configurada.
              </p>
            )}
          </Surface>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
