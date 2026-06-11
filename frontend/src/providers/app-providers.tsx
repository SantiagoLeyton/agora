"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";
import { ApiError } from "@/services/api-error";
import { useCurrentUser } from "@/hooks/use-current-user";
import { queryClientDefaultOptions } from "@/lib/query-client";
import { useAuthStore } from "@/store";
import { mapAuthenticatedUserToUser } from "@/types/auth";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryClientDefaultOptions,
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="simulador-theme"
        disableTransitionOnChange
      >
        <AuthSessionSync />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthSessionSync() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!hasHydrated) return;
    setAuthLoading(isAuthenticated && Boolean(accessToken) && currentUser.isLoading);
  }, [
    accessToken,
    currentUser.isLoading,
    hasHydrated,
    isAuthenticated,
    setAuthLoading,
  ]);

  useEffect(() => {
    if (currentUser.data) {
      setCurrentUser(mapAuthenticatedUserToUser(currentUser.data));
    }
  }, [currentUser.data, setCurrentUser]);

  useEffect(() => {
    if (
      currentUser.error instanceof ApiError &&
      [401, 403].includes(currentUser.error.status)
    ) {
      clearSession();
    }
  }, [clearSession, currentUser.error]);

  return null;
}
