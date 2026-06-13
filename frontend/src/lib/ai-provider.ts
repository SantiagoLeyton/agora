import type { AISummaryResponse } from "@/types/simulation";

export type AiProviderKind = "ollama" | "mock" | "deterministic" | "unknown";

export function resolveAiProviderKind(
  summary: Pick<AISummaryResponse, "modeloUtilizado" | "fueExitosa">
): AiProviderKind {
  const model = summary.modeloUtilizado.toLowerCase();
  if (summary.fueExitosa && (model.includes("llama") || model.includes("ollama"))) {
    return "ollama";
  }
  if (summary.fueExitosa && model.includes("mock")) {
    return "mock";
  }
  if (model.includes("deterministic") || model.includes("fallback")) {
    return "deterministic";
  }
  return summary.fueExitosa ? "unknown" : "deterministic";
}

export function resolveAiProviderLabel(
  summary: Pick<AISummaryResponse, "modeloUtilizado" | "fueExitosa">
): string {
  switch (resolveAiProviderKind(summary)) {
    case "ollama":
      return "IA real (Ollama)";
    case "mock":
      return "Fallback mock";
    case "deterministic":
      return "Fallback determinístico";
    default:
      return summary.fueExitosa ? "IA generada" : "Respuesta alternativa";
  }
}
