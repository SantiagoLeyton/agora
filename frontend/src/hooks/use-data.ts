import { useQuery } from "@tanstack/react-query";
import { caseService, evaluationService, teacherService } from "@/services/api";

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: caseService.getAll,
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ["cases", id],
    queryFn: () => caseService.getById(id),
    enabled: !!id,
  });
}

export function useEvaluations() {
  return useQuery({
    queryKey: ["evaluations"],
    queryFn: evaluationService.getAll,
  });
}

export function useEvaluation(id: string) {
  return useQuery({
    queryKey: ["evaluations", id],
    queryFn: () => evaluationService.getById(id),
    enabled: !!id,
  });
}

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: teacherService.getStudents,
  });
}

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: teacherService.getGroups,
  });
}

export function useAssignments() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: teacherService.getAssignments,
  });
}
