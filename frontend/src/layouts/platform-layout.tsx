"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/layouts/app-shell";
import { SplashScreen } from "@/components/shared/splash-screen";
import { useAuthStore } from "@/store";
import { useRoleGuard } from "@/hooks/use-role-guard";

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export function PlatformLayout({ children }: PlatformLayoutProps) {
  const router = useRouter();
  const { hasHydrated, isAuthenticated, isLoading, user } = useAuthStore();

  useRoleGuard();

  useEffect(() => {
    if (hasHydrated && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, isLoading, router]);

  if (!hasHydrated || isLoading || !isAuthenticated || !user) {
    return <SplashScreen message="Verificando acceso institucional..." />;
  }

  return <AppShell>{children}</AppShell>;
}
