"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavigationForRole, groupNavigationBySection } from "@/lib/navigation";
import { getRoleHomePath, getRoleLabel } from "@/lib/auth";
import { getRoleWorkspaceLabel } from "@/lib/page-meta";
import { iconMap } from "@/lib/icons";
import { useAuthStore, useUIStore } from "@/store";
import { InstitutionalLogo } from "@/components/shared/institutional-logo";
import { SidebarAccent } from "@/components/design-system/decorative-shapes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BRAND } from "@/lib/branding";
import { tokens } from "@/styles/tokens";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  const navigation = user ? getNavigationForRole(user.role) : [];
  const navGroups = groupNavigationBySection(navigation);
  const workspaceLabel = user ? getRoleWorkspaceLabel(user.role) : "";

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const homePath = user ? getRoleHomePath(user.role) : "/login";

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 76 : 288 }}
      transition={{ duration: tokens.motion.base, ease: tokens.motion.ease }}
      className="relative z-20 hidden h-screen flex-col border-r border-sidebar-border/70 bg-gradient-to-b from-sidebar to-muted/30 shadow-[1px_0_0_0_hsl(var(--sidebar-border)/0.5)] backdrop-blur-xl lg:flex"
    >
      <SidebarAccent />

      <div className="relative flex h-[4.5rem] items-center border-b border-sidebar-border/50 px-4">
        <InstitutionalLogo
          size="sm"
          href={homePath}
          collapsed={sidebarCollapsed}
          subtitle={BRAND.platformName}
        />
      </div>

      {!sidebarCollapsed && user && (
        <div className="relative mx-3 mt-4 overflow-hidden rounded-xl border border-primary/10 bg-card/90 p-3 shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--surface-ring))]">
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/[0.08] blur-xl" />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
            {workspaceLabel}
          </p>
          <p className="relative mt-1 text-[11px] leading-snug text-muted-foreground">
            {BRAND.institutionName}
          </p>
          <Badge variant="outline" className="relative mt-2 border-primary/15 bg-primary/[0.04] text-[9px] font-medium text-primary">
            Semestre 2026-I
          </Badge>
        </div>
      )}

      <ScrollArea className="relative flex-1 px-3 py-4">
        <LayoutGroup id="sidebar-nav">
          {navGroups.map((group, groupIndex) => (
            <div key={group.section} className={cn(groupIndex > 0 && "mt-5")}>
              {!sidebarCollapsed && (
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                  {group.section}
                </p>
              )}
              {sidebarCollapsed && groupIndex > 0 && (
                <Separator className="my-2 bg-sidebar-border/60" />
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive =
                    pathname === item.href ||
                    (item.href !== homePath && pathname.startsWith(item.href));

                  return (
                    <Link key={item.href} href={item.href} className="block">
                      <motion.div
                        whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
                        transition={{ duration: tokens.motion.fast }}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-xl bg-card shadow-[var(--shadow-sm),var(--shadow-glow-primary)] ring-1 ring-primary/15"
                            transition={tokens.motion.spring}
                          />
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:bg-muted/50 group-hover:opacity-100 group-hover:shadow-[var(--shadow-sm)]" />
                        )}
                        {Icon && (
                          <Icon
                            className={cn(
                              "relative z-10 h-[18px] w-[18px] shrink-0 transition-colors",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/80"
                            )}
                          />
                        )}
                        {!sidebarCollapsed && (
                          <span className="relative z-10 flex-1 truncate">{item.title}</span>
                        )}
                        {!sidebarCollapsed && item.badge && (
                          <Badge
                            variant="outline"
                            className="relative z-10 border-primary/15 bg-primary/[0.05] text-[9px] text-primary"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </LayoutGroup>
      </ScrollArea>

      <div className="relative border-t border-sidebar-border/50 bg-sidebar/80 p-3 backdrop-blur-sm">
        {!sidebarCollapsed && user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2.5 shadow-[var(--shadow-sm)]">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "default"}
          className={cn(
            "w-full text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            !sidebarCollapsed && "justify-start"
          )}
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3.5 top-[4.75rem] z-10 h-7 w-7 rounded-full border-border bg-card shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-elevated)]"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </Button>
    </motion.aside>
  );
}
