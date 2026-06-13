"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NavbarUserMenu } from "@/components/shared/navbar-user-menu";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";
import { getPageHeroMeta } from "@/lib/page-meta";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const meta = getPageHeroMeta(pathname);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: tokens.motion.base, ease: tokens.motion.easeOut }}
      className={cn(
        "sticky top-0 z-30 flex h-[3.875rem] items-center gap-3 border-b border-border/40 px-4 lg:px-8",
        "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        "shadow-[0_1px_0_0_hsl(var(--border)/0.4)]",
        className
      )}
    >
      <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">
          {meta.eyebrow}
        </p>
        <h1 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
          {meta.title}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <ThemeToggle />
        <NavbarUserMenu />
      </div>
    </motion.header>
  );
}
