"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";

interface ActionTileProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function ActionTile({ href, icon: Icon, title, description, index = 0 }: ActionTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * tokens.motion.stagger }}
      whileHover={{ y: -3, transition: { duration: tokens.motion.fast } }}
    >
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-border/55 p-5",
          "bg-gradient-to-br from-card to-muted/20",
          "shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--surface-ring))]",
          "transition-[box-shadow,border-color] duration-300",
          "hover:border-primary/20 hover:shadow-[var(--shadow-md)]"
        )}
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/[0.05] opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:shadow-[var(--shadow-glow-primary)]">
          <Icon className="h-5 w-5" />
        </div>
        <p className="relative text-sm font-semibold text-foreground">{title}</p>
        <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </Link>
    </motion.div>
  );
}

export function ActionTileGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}
