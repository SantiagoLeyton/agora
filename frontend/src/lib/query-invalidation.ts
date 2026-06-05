import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export const queryInvalidation = {
  cases: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.cases.all() }),
  evaluations: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.all() }),
  students: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.students() }),
  groups: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.groups() }),
  assignments: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.assignments() }),
} as const;
