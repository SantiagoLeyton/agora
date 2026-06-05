"use client";

import { motion } from "framer-motion";
import { InstitutionalLogo } from "@/components/shared/institutional-logo";
import { BRAND } from "@/lib/branding";

interface SplashScreenProps {
  message?: string;
}

export function SplashScreen({ message = "Cargando plataforma..." }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <InstitutionalLogo size="xl" showText subtitle={BRAND.institutionName} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-brand"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "40%" }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
