import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export const queryInvalidation = {
  auth: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all() }),
  cases: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.cases.all() }),
  simulations: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.simulations.all() }),
  simulation: (queryClient: QueryClient, id: number) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.simulations.detail(id) }),
  simulationSummary: (queryClient: QueryClient, id: number) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.simulations.summary(id) }),
  attempts: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.attempts.all() }),
  attempt: (queryClient: QueryClient, id: number) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.attempts.detail(id) }),
  attemptSummary: (queryClient: QueryClient, id: number) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.attempts.summary(id) }),
  attemptFeedback: (queryClient: QueryClient, id: number) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.attempts.feedback(id) }),
  attemptAiSummary: (queryClient: QueryClient, id: number) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.attempts.aiSummary(id) }),
  evaluations: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.all() }),
  evaluation: (queryClient: QueryClient, id: string) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.detail(id) }),
  users: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
  roles: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  students: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.students() }),
  groups: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all() }),
  groupStudents: (queryClient: QueryClient, groupId: number) =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.groups.students(groupId),
    }),
  schedules: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() }),
  assignments: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.assignments() }),
  teacherFeedback: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.teacherFeedback.all() }),
} as const;
