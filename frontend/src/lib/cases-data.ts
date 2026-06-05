import { mockCases, mockScenes } from "@/mocks";
import type { Scene, SimulationCase } from "@/types";

const CATALOG_STORAGE_KEY = "simulador-cases-catalog";

interface PersistedCatalog {
  state?: {
    customCases?: SimulationCase[];
    customScenes?: Record<string, Scene[]>;
  };
}

function readPersistedCatalog(): {
  customCases: SimulationCase[];
  customScenes: Record<string, Scene[]>;
} {
  if (typeof window === "undefined") {
    return { customCases: [], customScenes: {} };
  }
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return { customCases: [], customScenes: {} };
    const parsed = JSON.parse(raw) as PersistedCatalog;
    return {
      customCases: parsed.state?.customCases ?? [],
      customScenes: parsed.state?.customScenes ?? {},
    };
  } catch {
    return { customCases: [], customScenes: {} };
  }
}

export function getAllSimulationCases(): SimulationCase[] {
  const { customCases } = readPersistedCatalog();
  return [...mockCases, ...customCases];
}

export function getSimulationCaseById(id: string): SimulationCase | undefined {
  return getAllSimulationCases().find((c) => c.id === id);
}

export function getScenesForCase(caseId: string): Scene[] {
  const { customScenes } = readPersistedCatalog();
  return mockScenes[caseId] ?? customScenes[caseId] ?? [];
}

export function isCustomCase(caseId: string): boolean {
  const { customCases } = readPersistedCatalog();
  return customCases.some((c) => c.id === caseId);
}
