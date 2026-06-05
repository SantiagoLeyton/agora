"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRoleHomePath, isPathAllowedForRole } from "@/lib/auth";
import { useAuthStore } from "@/store";

export function useRoleGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (!isPathAllowedForRole(pathname, user.role)) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [isAuthenticated, user, pathname, router]);
}
