"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTimeGreeting, getMotivationalMessage } from "@/lib/greeting";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  firstName: string;
  overallProgress?: number;
  activeCaseTitle?: string;
  activeCaseProgress?: number;
  activeCaseHref?: string;
}

export function DashboardHero({
  firstName,
  overallProgress = 68,
  activeCaseTitle = "Ansiedad generalizada en contexto universitario",
  activeCaseProgress = 35,
  activeCaseHref = "/simulator/case-anxiety-001/play",
}: DashboardHeroProps) {
  const greeting = getTimeGreeting();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/10",
        "bg-gradient-to-br from-primary/[0.07] via-card to-card",
        "p-6 sm:p-8 lg:p-10",
        "shadow-[0_4px_24px_-4px_rgba(15,50,90,0.1)]"
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand/[0.04] blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr,minmax(260px,320px)] lg:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {BRAND.institutionName}
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {getMotivationalMessage()}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-sm">
              <Link href={activeCaseHref}>
                Continuar simulación
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/simulator">Explorar casos</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border/60 bg-background/60 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Progreso del semestre
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Competencias globales</span>
              <span className="font-semibold tabular-nums">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          <div className="border-t border-border/60 pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Caso activo
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{activeCaseTitle}</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avance</span>
                <span className="font-medium text-info">{activeCaseProgress}%</span>
              </div>
              <Progress value={activeCaseProgress} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
