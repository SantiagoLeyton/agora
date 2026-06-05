"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DecisionPathNode } from "@/lib/simulator-clinical";
import { Search, ClipboardList, Heart, LogOut, Circle } from "lucide-react";

const categoryIcons = {
  explore: Search,
  assess: ClipboardList,
  intervene: Heart,
  close: LogOut,
};

interface DecisionPathProps {
  nodes: DecisionPathNode[];
  className?: string;
}

export function DecisionPath({ nodes, className }: DecisionPathProps) {
  if (nodes.length === 0) return null;

  return (
    <div className={cn("ds-panel p-4", className)}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Camino clínico narrativo
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {nodes.map((node, i) => {
          const Icon = node.category ? categoryIcons[node.category] : Circle;
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2"
            >
              {i > 0 && <span className="text-muted-foreground/40">→</span>}
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                  node.isCurrent
                    ? "border-primary/30 bg-primary/10 text-primary shadow-[var(--shadow-glow-primary)]"
                    : "border-border/50 bg-muted/30 text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="max-w-[120px] truncate">{node.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
