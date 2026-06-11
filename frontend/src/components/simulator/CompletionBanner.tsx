"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { tokens } from "@/styles/tokens";
import { cn } from "@/lib/utils";

interface CompletionBannerProps {
  duration: number;
  allianceScore: number;
  className?: string;
}

export function CompletionBanner({
  duration,
  allianceScore,
  className,
}: CompletionBannerProps) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: tokens.motion.easeOut }}
      className={cn(
        "border-b border-success/20 bg-gradient-to-r from-success/[0.08] via-transparent to-success/[0.04] px-4 py-4 sm:px-6 sm:py-5",
        className
      )}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
          <h2 className="text-lg font-semibold text-success">
            Sesión completada exitosamente
          </h2>
        </div>
        <p className="text-sm text-muted-foreground ml-8">
          Duración: <span className="font-medium text-foreground">{minutes}m {seconds}s</span>
          {" "} • Alianza terapéutica alcanzada: <span className="font-medium text-success">{Math.round(allianceScore)}%</span>
        </p>
      </div>
    </motion.div>
  );
}
