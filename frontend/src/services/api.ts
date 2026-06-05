import { mockEvaluationResults, mockStudents, mockGroups, mockAssignments } from "@/mocks";
import {
  getAllSimulationCases,
  getSimulationCaseById,
} from "@/lib/cases-data";
import type { SimulationCase, EvaluationResult, Student, Group, Assignment } from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const caseService = {
  getAll: async (): Promise<SimulationCase[]> => {
    await delay(400);
    return getAllSimulationCases();
  },
  getById: async (id: string): Promise<SimulationCase | undefined> => {
    await delay(300);
    return getSimulationCaseById(id);
  },
};

export const evaluationService = {
  getAll: async (): Promise<EvaluationResult[]> => {
    await delay(400);
    return mockEvaluationResults;
  },
  getById: async (id: string): Promise<EvaluationResult | undefined> => {
    await delay(300);
    return mockEvaluationResults.find((e) => e.id === id);
  },
};

export const teacherService = {
  getStudents: async (): Promise<Student[]> => {
    await delay(400);
    return mockStudents;
  },
  getGroups: async (): Promise<Group[]> => {
    await delay(400);
    return mockGroups;
  },
  getAssignments: async (): Promise<Assignment[]> => {
    await delay(400);
    return mockAssignments;
  },
};
