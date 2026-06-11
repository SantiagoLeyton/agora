"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRoleHomePath, isPathAllowedForRole } from "@/lib/auth";
import { useAuthStore } from "@/store";

export function useRoleGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasHydrated, isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated || isLoading) return;
    if (!isAuthenticated || !user) return;

    if (!isPathAllowedForRole(pathname, user.role)) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [hasHydrated, isAuthenticated, isLoading, user, pathname, router]);
}
