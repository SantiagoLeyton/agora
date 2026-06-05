import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Scene, SimulationCase } from "@/types";

export interface TeacherCaseBundle {
  case: SimulationCase;
  scenes: Scene[];
}

interface CasesCatalogState {
  customCases: SimulationCase[];
  customScenes: Record<string, Scene[]>;
  addCase: (bundle: TeacherCaseBundle) => void;
  removeCase: (caseId: string) => void;
}

export const useCasesCatalogStore = create<CasesCatalogState>()(
  persist(
    (set) => ({
      customCases: [],
      customScenes: {},
      addCase: (bundle) =>
        set((state) => ({
          customCases: [...state.customCases, bundle.case],
          customScenes: {
            ...state.customScenes,
            [bundle.case.id]: bundle.scenes,
          },
        })),
      removeCase: (caseId) =>
        set((state) => {
          const { [caseId]: _, ...restScenes } = state.customScenes;
          return {
            customCases: state.customCases.filter((c) => c.id !== caseId),
            customScenes: restScenes,
          };
        }),
    }),
    { name: "simulador-cases-catalog" }
  )
);
