import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { queryInvalidation } from "@/lib/query-invalidation";
import { evaluationService } from "@/services/api";
import { attemptService, type AttemptFilters } from "@/services/attempt-service";
import { clinicalCaseService } from "@/services/case-service";
import { teacherFeedbackService } from "@/services/teacher-feedback-service";
import { teacherMetricsService } from "@/services/teacher-metrics-service";
import { pedagogicalService } from "@/services/pedagogical-service";
import { studentSessionService } from "@/services/student-session-service";
import { simulationService } from "@/services/simulation-service";
import { mapCaseToSimulationCase } from "@/lib/case-adapters";
import {
  groupService,
  groupStudentService,
  roleService,
  scheduleService,
  userService,
} from "@/services/academic-admin-service";
import {
  mapGroupStudentToStudent,
  mapGroupToUiGroup,
  mapScheduleToAssignment,
} from "@/lib/academic-adapters";
import type {
  GroupFilters,
  AddGroupStudentRequest,
  ChangePasswordRequest,
  CreateGroupRequest,
  CreateScheduleRequest,
  CreateUserRequest,
  ScheduleFilters,
  UpdateGroupRequest,
  UpdateScheduleRequest,
  UpdateUserRequest,
  UserFilters,
} from "@/types/academic-admin";
import type { CaseFilters, CaseRequest, OptionRequest, QuestionRequest, SceneRequest } from "@/types/clinical-case";
import type { AISummaryRequest, AnswerSimulationRequest, CreateFeedbackRequest, StartSimulationRequest } from "@/types/simulation";
import { caseResourceService } from "@/services/case-resource-service";
import type { CreateCaseBundleRequest, UpdateCaseBundleRequest } from "@/services/case-service";
import type { TeacherMetricsFilters } from "@/types/teacher-metrics";

export function useCases(filters: CaseFilters = { size: 100 }) {
  return useQuery({
    queryKey: queryKeys.cases.list(filters),
    queryFn: async () => {
      const page = await clinicalCaseService.list(filters);
      return page.content.map(mapCaseToSimulationCase);
    },
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: queryKeys.cases.detail(id),
    queryFn: async () => mapCaseToSimulationCase(await clinicalCaseService.detail(Number(id))),
    enabled: Number.isFinite(Number(id)),
  });
}

export function useCaseBuilder(id: string) {
  return useQuery({
    queryKey: queryKeys.cases.builder(id),
    queryFn: () => clinicalCaseService.builder(Number(id)),
    enabled: Number.isFinite(Number(id)),
  });
}

export function useSimulation(attemptId?: number) {
  return useQuery({
    queryKey: queryKeys.simulations.detail(attemptId ?? 0),
    queryFn: () => simulationService.detail(attemptId ?? 0),
    enabled: Number.isFinite(attemptId),
  });
}

export function useAttemptSummary(attemptId?: number) {
  return useQuery({
    queryKey: queryKeys.attempts.summary(attemptId ?? 0),
    queryFn: () => simulationService.summary(attemptId ?? 0),
    enabled: Number.isFinite(attemptId),
  });
}

export function useAttempts(filters: AttemptFilters = { size: 100, sort: "fechaInicio,desc" }) {
  return useQuery({
    queryKey: queryKeys.attempts.list(filters),
    queryFn: () => attemptService.list(filters),
  });
}

export function useAttempt(attemptId?: number) {
  return useQuery({
    queryKey: queryKeys.attempts.detail(attemptId ?? 0),
    queryFn: () => attemptService.detail(attemptId ?? 0),
    enabled: Number.isFinite(attemptId),
  });
}

export function useAttemptFeedback(attemptId?: number) {
  return useQuery({
    queryKey: queryKeys.attempts.feedback(attemptId ?? 0),
    queryFn: () => attemptService.feedback(attemptId ?? 0),
    enabled: Number.isFinite(attemptId),
  });
}

export function useTeacherFeedbackQueue() {
  return useQuery({
    queryKey: queryKeys.teacherFeedback.all(),
    queryFn: () => teacherFeedbackService.list(),
  });
}

export function useMyAcademicProgress() {
  return useQuery({
    queryKey: ["academic-progress", "me"],
    queryFn: () => pedagogicalService.myProgress(),
  });
}

export function useStudentAcademicProgress(studentId: number) {
  return useQuery({
    queryKey: ["academic-progress", studentId],
    queryFn: () => pedagogicalService.studentProgress(studentId),
    enabled: Number.isFinite(studentId),
  });
}

export function useRdaEvaluation(attemptId?: number) {
  return useQuery({
    queryKey: ["rda-evaluation", attemptId ?? 0],
    queryFn: () => pedagogicalService.rdaEvaluation(attemptId ?? 0),
    enabled: Number.isFinite(attemptId),
  });
}

export function useTeacherMetrics(filters: TeacherMetricsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.teacherMetrics.detail(filters),
    queryFn: () => teacherMetricsService.get(filters),
  });
}

export function useMyAssignedSessions() {
  return useQuery({
    queryKey: queryKeys.studentSessions.all(),
    queryFn: () => studentSessionService.listAssigned(),
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      request,
    }: {
      attemptId: number;
      request: CreateFeedbackRequest;
    }) => attemptService.createFeedback(attemptId, request),
    onSuccess: (_, { attemptId }) => {
      queryInvalidation.attemptFeedback(queryClient, attemptId);
      queryInvalidation.attemptSummary(queryClient, attemptId);
      queryInvalidation.attempts(queryClient);
      queryInvalidation.teacherFeedback(queryClient);
      queryInvalidation.evaluations(queryClient);
    },
  });
}

export function useAttemptAISummaries(attemptId?: number) {
  return useQuery({
    queryKey: queryKeys.attempts.aiSummary(attemptId ?? 0),
    queryFn: () => attemptService.aiSummaries(attemptId ?? 0),
    enabled: Number.isFinite(attemptId),
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
    queryFn: async () => {
      const groupsPage = await groupService.list({ size: 100 });
      const studentsByGroup = await Promise.all(
        groupsPage.content.map(async (group) => ({
          group,
          students: await groupStudentService.list(group.id),
        }))
      );

      return studentsByGroup.flatMap(({ group, students }) =>
        students.map((student) =>
          mapGroupStudentToStudent(student, group.nombre, group.id)
        )
      );
    },
  });
}

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups.summary({ size: 100 }),
    queryFn: async () => {
      const [groupsPage, schedulesPage] = await Promise.all([
        groupService.list({ size: 100 }),
        scheduleService.list({ activo: true, size: 100 }),
      ]);

      const studentsByGroup = await Promise.all(
        groupsPage.content.map(async (group) => ({
          groupId: group.id,
          students: await groupStudentService.list(group.id),
        }))
      );

      return groupsPage.content.map((group) => {
        const studentsCount =
          studentsByGroup.find((item) => item.groupId === group.id)?.students
            .length ?? 0;
        const activeCases = schedulesPage.content.filter(
          (schedule) => schedule.grupoId === group.id && schedule.activo
        ).length;

        return mapGroupToUiGroup(group, studentsCount, activeCases);
      });
    },
  });
}

export function useAssignments() {
  return useQuery({
    queryKey: queryKeys.assignments(),
    queryFn: async () => {
      const schedulesPage = await scheduleService.list({
        activo: true,
        size: 100,
      });

      return schedulesPage.content.map(mapScheduleToAssignment);
    },
  });
}

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.list(filters),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.detail(id),
    enabled: Number.isFinite(id),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all(),
    queryFn: roleService.list,
  });
}

export function useAcademicGroups(filters?: GroupFilters) {
  return useQuery({
    queryKey: queryKeys.groups.list(filters),
    queryFn: () => groupService.list(filters),
  });
}

export function useAcademicGroup(id: number) {
  return useQuery({
    queryKey: queryKeys.groups.detail(id),
    queryFn: () => groupService.detail(id),
    enabled: Number.isFinite(id),
  });
}

export function useGroupStudents(groupId: number) {
  return useQuery({
    queryKey: queryKeys.groups.students(groupId),
    queryFn: () => groupStudentService.list(groupId),
    enabled: Number.isFinite(groupId),
  });
}

export function useSchedules(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: queryKeys.schedules.list(filters),
    queryFn: () => scheduleService.list(filters),
  });
}

export function useSchedule(id: number) {
  return useQuery({
    queryKey: queryKeys.schedules.detail(id),
    queryFn: () => scheduleService.detail(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUserRequest) => userService.create(request),
    onSuccess: () => queryInvalidation.users(queryClient),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateUserRequest;
    }) => userService.update(id, request),
    onSuccess: () => queryInvalidation.users(queryClient),
  });
}

export function useChangeUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: ChangePasswordRequest;
    }) => userService.changePassword(id, request),
    onSuccess: () => queryInvalidation.users(queryClient),
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.activate,
    onSuccess: () => queryInvalidation.users(queryClient),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deactivate,
    onSuccess: () => queryInvalidation.users(queryClient),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateGroupRequest) => groupService.create(request),
    onSuccess: () => queryInvalidation.groups(queryClient),
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateGroupRequest;
    }) => groupService.update(id, request),
    onSuccess: () => queryInvalidation.groups(queryClient),
  });
}

export function useActivateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupService.activate,
    onSuccess: () => queryInvalidation.groups(queryClient),
  });
}

export function useDeactivateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupService.deactivate,
    onSuccess: () => queryInvalidation.groups(queryClient),
  });
}

export function useAddGroupStudent(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddGroupStudentRequest) =>
      groupStudentService.add(groupId, request),
    onSuccess: () => {
      queryInvalidation.groupStudents(queryClient, groupId);
      queryInvalidation.students(queryClient);
      queryInvalidation.groups(queryClient);
    },
  });
}

export function useRemoveGroupStudent(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estudianteId: number) =>
      groupStudentService.remove(groupId, estudianteId),
    onSuccess: () => {
      queryInvalidation.groupStudents(queryClient, groupId);
      queryInvalidation.students(queryClient);
      queryInvalidation.groups(queryClient);
    },
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateScheduleRequest) =>
      scheduleService.create(request),
    onSuccess: () => {
      queryInvalidation.schedules(queryClient);
      queryInvalidation.assignments(queryClient);
      queryInvalidation.groups(queryClient);
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateScheduleRequest;
    }) => scheduleService.update(id, request),
    onSuccess: () => {
      queryInvalidation.schedules(queryClient);
      queryInvalidation.assignments(queryClient);
      queryInvalidation.groups(queryClient);
    },
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CaseRequest) => clinicalCaseService.create(request),
    onSuccess: () => queryInvalidation.cases(queryClient),
  });
}

export function useCreateScene(caseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SceneRequest) =>
      clinicalCaseService.createScene(caseId, request),
    onSuccess: () => queryInvalidation.cases(queryClient),
  });
}

export function useCreateQuestion(sceneId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: QuestionRequest) =>
      clinicalCaseService.createQuestion(sceneId, request),
    onSuccess: () => queryInvalidation.cases(queryClient),
  });
}

export function useCreateOption(questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: OptionRequest) =>
      clinicalCaseService.createOption(questionId, request),
    onSuccess: () => queryInvalidation.cases(queryClient),
  });
}

export function useCreateCaseBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCaseBundleRequest) =>
      clinicalCaseService.createBundle(request),
    onSuccess: () => queryInvalidation.cases(queryClient),
  });
}

export function useUpdateCaseBundle(caseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCaseBundleRequest) =>
      clinicalCaseService.updateBundle(caseId, request),
    onSuccess: () => queryInvalidation.cases(queryClient),
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clinicalCaseService.delete(id),
    onSuccess: () => queryInvalidation.cases(queryClient),
  });
}

export function useClinicalTools() {
  return useQuery({
    queryKey: ["clinical-tools"],
    queryFn: async () => (await caseResourceService.listTools()).content,
  });
}

export function useClinicalEntities() {
  return useQuery({
    queryKey: ["clinical-entities"],
    queryFn: async () => (await caseResourceService.listEntities()).content,
  });
}

export function useStartSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartSimulationRequest) =>
      simulationService.start(request),
    onSuccess: () => queryInvalidation.simulations(queryClient),
  });
}

export function useAnswerSimulation(attemptId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AnswerSimulationRequest) =>
      simulationService.answer(attemptId, request),
    onSuccess: () => {
      queryInvalidation.simulation(queryClient, attemptId);
      queryInvalidation.simulationSummary(queryClient, attemptId);
      queryInvalidation.attemptSummary(queryClient, attemptId);
    },
  });
}

export function useFinishSimulation(attemptId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => simulationService.finish(attemptId),
    onSuccess: () => {
      queryInvalidation.simulation(queryClient, attemptId);
      queryInvalidation.simulationSummary(queryClient, attemptId);
      queryInvalidation.attemptSummary(queryClient, attemptId);
      queryInvalidation.attemptFeedback(queryClient, attemptId);
      queryInvalidation.evaluations(queryClient);
    },
  });
}

export function useGenerateAISummary(attemptId: number, evaluationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AISummaryRequest = {}) =>
      attemptService.generateAISummary(attemptId, request),
    onSuccess: () => {
      queryInvalidation.attemptAiSummary(queryClient, attemptId);
      queryInvalidation.attemptSummary(queryClient, attemptId);
      queryInvalidation.simulationSummary(queryClient, attemptId);
      queryInvalidation.evaluations(queryClient);
      if (evaluationId) {
        queryInvalidation.evaluation(queryClient, evaluationId);
      }
    },
  });
}
