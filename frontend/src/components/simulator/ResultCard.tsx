"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { tokens } from "@/styles/tokens";

interface ResultCardProps {
  title: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
  index?: number;
}

const variantStyles = {
  default: "border-border/40 bg-card/70",
  success: "border-success/20 bg-success/[0.04]",
  info: "border-info/20 bg-info/[0.04]",
  warning: "border-warning/20 bg-warning/[0.04]",
};

const titleStyles = {
  default: "text-muted-foreground",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
};

export function ResultCard({
  title,
  icon,
  variant = "default",
  children,
  className,
  index = 0,
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: tokens.motion.easeOut,
      }}
      className={cn(
        "rounded-lg border px-4 py-4 sm:px-5 sm:py-5",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="shrink-0 text-lg">{icon}</div>}
        <h3 className={cn(
          "text-sm font-semibold uppercase tracking-[0.12em]",
          titleStyles[variant]
        )}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}
