"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SurfaceVariant } from "@/styles/tokens";
import { tokens } from "@/styles/tokens";

const variants: Record<SurfaceVariant, string> = {
  default:
    "bg-gradient-to-br from-card to-card/95 border-border/60 shadow-[var(--shadow-card)] ring-1 ring-[hsl(var(--surface-ring))]",
  elevated:
    "bg-card border-border/55 shadow-[var(--shadow-elevated)] ring-1 ring-[hsl(var(--surface-ring))]",
  muted:
    "bg-muted/45 border-border/50 backdrop-blur-sm",
  ghost:
    "bg-transparent border-transparent shadow-none ring-0",
};

interface SurfaceProps extends HTMLMotionProps<"div"> {
  variant?: SurfaceVariant;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Surface({
  variant = "default",
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: tokens.motion.base }}
      whileHover={
        hover
          ? { y: -4, transition: { duration: 0.3, ease: tokens.motion.easeOut } }
          : undefined
      }
      className={cn(
        "rounded-2xl border",
        variants[variant],
        paddingMap[padding],
        hover &&
          "transition-[box-shadow,border-color,background-color] duration-300 hover:border-primary/20 hover:shadow-[var(--shadow-elevated)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const PremiumSurface = Surface;
