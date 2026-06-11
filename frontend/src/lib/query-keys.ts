export const queryKeys = {
  auth: {
    all: () => ["auth"] as const,
    session: () => ["auth", "session"] as const,
    me: () => ["auth", "me"] as const,
  },
  health: () => ["health"] as const,
  cases: {
    all: () => ["cases"] as const,
    list: (filters?: unknown) => ["cases", "list", filters] as const,
    detail: (id: string) => ["cases", id] as const,
    builder: (id: string) => ["cases", id, "builder"] as const,
    scenes: (id: string) => ["cases", id, "scenes"] as const,
  },
  simulations: {
    all: () => ["simulations"] as const,
    detail: (id: number) => ["simulations", id] as const,
    states: (id: number) => ["simulations", id, "states"] as const,
    summary: (id: number) => ["attempts", id, "summary"] as const,
  },
  attempts: {
    all: () => ["attempts"] as const,
    list: (filters?: unknown) => ["attempts", "list", filters] as const,
    detail: (id: number) => ["attempts", id] as const,
    feedback: (id: number) => ["attempts", id, "feedback"] as const,
    journal: (id: number) => ["attempts", id, "journal"] as const,
    summary: (id: number) => ["attempts", id, "summary"] as const,
    aiSummary: (id: number) => ["attempts", id, "ai", "summary"] as const,
  },
  evaluations: {
    all: () => ["evaluations"] as const,
    detail: (id: string) => ["evaluations", id] as const,
  },
  users: {
    all: () => ["users"] as const,
    list: (filters?: unknown) => ["users", "list", filters] as const,
    detail: (id: number) => ["users", id] as const,
  },
  roles: {
    all: () => ["roles"] as const,
  },
  students: () => ["students"] as const,
  groups: {
    all: () => ["groups"] as const,
    list: (filters?: unknown) => ["groups", "list", filters] as const,
    summary: (filters?: unknown) => ["groups", "summary", filters] as const,
    detail: (id: number) => ["groups", id] as const,
    students: (id: number) => ["groups", id, "students"] as const,
  },
  schedules: {
    all: () => ["schedules"] as const,
    list: (filters?: unknown) => ["schedules", "list", filters] as const,
    detail: (id: number) => ["schedules", id] as const,
  },
  assignments: () => ["assignments"] as const,
} as const;
