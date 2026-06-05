"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Stethoscope, MessageSquare, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypingNarrative } from "@/components/design-system";
import { ClinicalAvatar } from "@/components/design-system/clinical";
import type { Scene } from "@/types";
import { tokens } from "@/styles/tokens";

const speakerConfig = {
  patient: { icon: User, label: "Paciente", tone: "clinical" as const, accent: "border-l-info/80" },
  therapist: { icon: Stethoscope, label: "Terapeuta", tone: "student" as const, accent: "border-l-primary/80" },
  narrator: { icon: MessageSquare, label: "Narrador clínico", tone: "neutral" as const, accent: "border-l-border" },
  supervisor: { icon: Shield, label: "Supervisor", tone: "supervisor" as const, accent: "border-l-violet-400/60" },
};

interface NarrativeSceneProps {
  scene: Scene;
}

export function NarrativeScene({ scene }: NarrativeSceneProps) {
  const config = speakerConfig[scene.speakerRole];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: tokens.motion.easeOut }}
        className="flex flex-1 flex-col"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-sm)] backdrop-blur-sm">
            {scene.setting}
          </span>
          <span className="rounded-full border border-primary/15 bg-primary/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {scene.title}
          </span>
        </div>

        <div
          className={cn(
            "glass-surface flex-1 border-l-[3px] p-8 md:p-12",
            config.accent
          )}
        >
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center gap-4">
              <ClinicalAvatar name={scene.speaker} tone={config.tone} size="lg" />
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {config.label}
                </p>
                <p className="text-sm text-muted-foreground">{scene.speaker}</p>
              </div>
            </div>

            <TypingNarrative
              text={scene.narrative}
              enabled
              className="prose-academic text-lg leading-relaxed md:text-xl"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
