"use client";

import { motion } from "framer-motion";
import { Surface } from "./surface";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Surface variant="muted" className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </Surface>
    </motion.div>
  );
}
