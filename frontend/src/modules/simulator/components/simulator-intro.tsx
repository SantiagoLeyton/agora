"use client";

import { motion } from "framer-motion";
import { Brain, Shield, Users } from "lucide-react";

export function SimulatorIntro() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-primary/[0.05] via-card to-card p-6 sm:p-7"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Brain className="h-3.5 w-3.5" />
            Laboratorio clínico virtual
          </div>
          <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Casos clínicos de simulación psicosocial
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Practica intervención en entornos seguros con pacientes simulados, decisiones
            narrativas y retroalimentación académica especializada.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 lg:gap-6">
          {[
            { icon: Shield, label: "Entorno seguro", desc: "Sin riesgo clínico real" },
            { icon: Users, label: "Narrativa interactiva", desc: "Decisiones ramificadas" },
            { icon: Brain, label: "Evaluación formativa", desc: "Competencias clínicas" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/80 text-primary shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
