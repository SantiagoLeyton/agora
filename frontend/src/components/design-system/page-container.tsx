"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function PageContainer({ children, className, animate = true }: PageContainerProps) {
  const content = (
    <div className={cn("mx-auto w-full max-w-6xl space-y-8", className)}>{children}</div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: tokens.motion.base }}
    >
      {content}
    </motion.div>
  );
}
