/** Design tokens — fuente única de verdad para el ecosistema visual */
export const tokens = {
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.625rem",
    xl: "0.875rem",
    "2xl": "1rem",
    "3xl": "1.25rem",
    full: "9999px",
  },
  spacing: {
    pageX: "1.5rem",
    pageY: "2rem",
    section: "2rem",
    card: "1.25rem",
    cardLg: "1.75rem",
    tableRow: "1rem",
  },
  shadow: {
    sm: "0 1px 2px rgba(15, 40, 80, 0.04)",
    md: "0 4px 16px -4px rgba(15, 40, 80, 0.08)",
    lg: "0 12px 40px -12px rgba(15, 40, 80, 0.12)",
    glow: "0 0 0 1px rgba(255,255,255,0.85) inset, 0 8px 32px -8px rgba(15, 50, 90, 0.12)",
    glowPrimary: "0 0 24px -4px rgba(30, 64, 120, 0.12)",
  },
  motion: {
    fast: 0.15,
    base: 0.25,
    slow: 0.45,
    ease: [0.25, 0.1, 0.25, 1] as const,
    easeOut: [0.16, 1, 0.3, 1] as const,
    spring: { type: "spring" as const, stiffness: 380, damping: 32 },
    stagger: 0.05,
  },
  icon: {
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  },
} as const;

export type SurfaceVariant = "default" | "elevated" | "muted" | "ghost";

export const motionVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 },
    },
  },
} as const;
