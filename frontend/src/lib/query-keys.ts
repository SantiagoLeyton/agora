export const queryKeys = {
  health: () => ["health"] as const,
  cases: {
    all: () => ["cases"] as const,
    detail: (id: string) => ["cases", id] as const,
  },
  evaluations: {
    all: () => ["evaluations"] as const,
    detail: (id: string) => ["evaluations", id] as const,
  },
  students: () => ["students"] as const,
  groups: () => ["groups"] as const,
  assignments: () => ["assignments"] as const,
} as const;
