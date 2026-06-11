"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store";

export function useCurrentUser() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authService.me,
    enabled: hasHydrated && isAuthenticated && Boolean(accessToken),
    retry: false,
  });
}
