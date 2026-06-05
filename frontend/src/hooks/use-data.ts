import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { caseService, evaluationService, teacherService } from "@/services/api";

export function useCases() {
  return useQuery({
    queryKey: queryKeys.cases.all(),
    queryFn: caseService.getAll,
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: queryKeys.cases.detail(id),
    queryFn: () => caseService.getById(id),
    enabled: !!id,
  });
}

export function useEvaluations() {
  return useQuery({
    queryKey: queryKeys.evaluations.all(),
    queryFn: evaluationService.getAll,
  });
}

export function useEvaluation(id: string) {
  return useQuery({
    queryKey: queryKeys.evaluations.detail(id),
    queryFn: () => evaluationService.getById(id),
    enabled: !!id,
  });
}

export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students(),
    queryFn: teacherService.getStudents,
  });
}

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups(),
    queryFn: teacherService.getGroups,
  });
}

export function useAssignments() {
  return useQuery({
    queryKey: queryKeys.assignments(),
    queryFn: teacherService.getAssignments,
  });
}
