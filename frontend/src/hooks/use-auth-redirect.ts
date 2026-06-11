"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { getRoleHomePath } from "@/lib/auth";

export function useAuthRedirect() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !isLoading && isAuthenticated && user) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [hasHydrated, isAuthenticated, isLoading, user, router]);
}
