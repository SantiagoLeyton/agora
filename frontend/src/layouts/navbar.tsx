"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NavbarUserMenu } from "@/components/shared/navbar-user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const isSimulatorPlay = pathname.includes("/play");
  const isStudent = pathname.startsWith("/dashboard") || pathname.startsWith("/simulator") || pathname.startsWith("/evaluation");

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

      {!isSimulatorPlay && (
        <div className="relative hidden max-w-xs flex-1 md:block lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder={
              isStudent ? "Buscar casos, competencias..." : "Buscar en la plataforma..."
            }
            className="h-9 rounded-full border-border/50 bg-muted/50 pl-9 text-sm shadow-[var(--shadow-sm)] transition-shadow focus-visible:bg-card focus-visible:shadow-[var(--shadow-md)]"
          />
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-muted/50"
        >
          <Bell className="h-4 w-4" />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-background"
          />
        </Button>
        <ThemeToggle />
        <NavbarUserMenu />
      </div>
    </motion.header>
  );
}
