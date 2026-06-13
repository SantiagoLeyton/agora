import type { QueryClient } from "@tanstack/react-query";
import { useSimulatorStore } from "@/store";

export function resetUserScopedClientState(queryClient?: QueryClient) {
  useSimulatorStore.getState().endSession();
  if (typeof window !== "undefined") {
    localStorage.removeItem("simulador-session");
  }
  queryClient?.clear();
}

export const INSTITUTIONAL_PASSWORD_HINT =
  "Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo (ej. Agora12345*).";

export const INSTITUTIONAL_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

import { ApiError } from "@/services/api-error";

export function formatApiValidationError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const details = error.validationErrors
      ? Object.values(error.validationErrors).filter(Boolean)
      : [];
    if (details.length > 0) {
      return details.join(" ");
    }
    return error.message || fallback;
  }
  return fallback;
}
