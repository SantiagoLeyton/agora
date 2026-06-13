import { apiEndpoints } from "@/config/api";
import { httpClient } from "@/services/http-client";
import { withQuery } from "@/services/query-params";
import type {
  AddGroupStudentRequest,
  AddGroupTeacherRequest,
  BatchGroupStudentsRequest,
  BatchGroupStudentsResponse,
  ChangePasswordRequest,
  CreateGroupRequest,
  CreateScheduleRequest,
  CreateUserRequest,
  GroupFilters,
  GroupResponse,
  GroupStudentResponse,
  GroupTeacherResponse,
  JoinGroupRequest,
  RoleResponse,
  ScheduleFilters,
  ScheduleResponse,
  UpdateGroupRequest,
  UpdateScheduleRequest,
  UpdateUserRequest,
  UserFilters,
  UserResponse,
} from "@/types/academic-admin";
import type { PageResponse } from "@/types/page";

function groupStudentsPath(groupId: number): string {
  return `${apiEndpoints.groups}/${groupId}/students`;
}

export const userService = {
  list: (filters?: UserFilters) =>
    httpClient.get<PageResponse<UserResponse>>(
      withQuery(apiEndpoints.users, filters)
    ),
  detail: (id: number) =>
    httpClient.get<UserResponse>(`${apiEndpoints.users}/${id}`),
  create: (request: CreateUserRequest) =>
    httpClient.post<UserResponse, CreateUserRequest>(
      apiEndpoints.users,
      request
    ),
  update: (id: number, request: UpdateUserRequest) =>
    httpClient.put<UserResponse, UpdateUserRequest>(
      `${apiEndpoints.users}/${id}`,
      request
    ),
  changePassword: (id: number, request: ChangePasswordRequest) =>
    httpClient.patch<void, ChangePasswordRequest>(
      `${apiEndpoints.users}/${id}/password`,
      request
    ),
  activate: (id: number) =>
    httpClient.patch<UserResponse>(`${apiEndpoints.users}/${id}/activate`),
  deactivate: (id: number) =>
    httpClient.patch<UserResponse>(`${apiEndpoints.users}/${id}/deactivate`),
} as const;

export const roleService = {
  list: () => httpClient.get<RoleResponse[]>(apiEndpoints.roles),
} as const;

export const groupService = {
  list: (filters?: GroupFilters) =>
    httpClient.get<PageResponse<GroupResponse>>(
      withQuery(apiEndpoints.groups, filters)
    ),
  detail: (id: number) =>
    httpClient.get<GroupResponse>(`${apiEndpoints.groups}/${id}`),
  create: (request: CreateGroupRequest) =>
    httpClient.post<GroupResponse, CreateGroupRequest>(
      apiEndpoints.groups,
      request
    ),
  update: (id: number, request: UpdateGroupRequest) =>
    httpClient.put<GroupResponse, UpdateGroupRequest>(
      `${apiEndpoints.groups}/${id}`,
      request
    ),
  activate: (id: number) =>
    httpClient.patch<GroupResponse>(`${apiEndpoints.groups}/${id}/activate`),
  deactivate: (id: number) =>
    httpClient.patch<GroupResponse>(
      `${apiEndpoints.groups}/${id}/deactivate`
    ),
  remove: (id: number) =>
    httpClient.delete<void>(`${apiEndpoints.groups}/${id}`),
  join: (request: JoinGroupRequest) =>
    httpClient.post<GroupResponse, JoinGroupRequest>(
      `${apiEndpoints.groups}/join`,
      request
    ),
} as const;

function groupTeachersPath(groupId: number): string {
  return `${apiEndpoints.groups}/${groupId}/teachers`;
}

export const groupTeacherService = {
  list: (groupId: number) =>
    httpClient.get<GroupTeacherResponse[]>(groupTeachersPath(groupId)),
  add: (groupId: number, request: AddGroupTeacherRequest) =>
    httpClient.post<GroupTeacherResponse, AddGroupTeacherRequest>(
      groupTeachersPath(groupId),
      request
    ),
  remove: (groupId: number, docenteId: number) =>
    httpClient.delete<void>(
      withQuery(groupTeachersPath(groupId), { docenteId })
    ),
} as const;

export const groupStudentService = {
  list: (groupId: number) =>
    httpClient.get<GroupStudentResponse[]>(groupStudentsPath(groupId)),
  add: (groupId: number, request: AddGroupStudentRequest) =>
    httpClient.post<GroupStudentResponse, AddGroupStudentRequest>(
      groupStudentsPath(groupId),
      request
    ),
  remove: (groupId: number, estudianteId: number) =>
    httpClient.delete<void>(
      withQuery(groupStudentsPath(groupId), { estudianteId })
    ),
  addBatch: (groupId: number, request: BatchGroupStudentsRequest) =>
    httpClient.post<BatchGroupStudentsResponse, BatchGroupStudentsRequest>(
      `${groupStudentsPath(groupId)}/batch`,
      request
    ),
  removeBatch: (groupId: number, request: BatchGroupStudentsRequest) =>
    httpClient.post<BatchGroupStudentsResponse, BatchGroupStudentsRequest>(
      `${groupStudentsPath(groupId)}/batch-remove`,
      request
    ),
} as const;

export const scheduleService = {
  list: (filters?: ScheduleFilters) =>
    httpClient.get<PageResponse<ScheduleResponse>>(
      withQuery(apiEndpoints.schedules, filters)
    ),
  detail: (id: number) =>
    httpClient.get<ScheduleResponse>(`${apiEndpoints.schedules}/${id}`),
  create: (request: CreateScheduleRequest) =>
    httpClient.post<ScheduleResponse, CreateScheduleRequest>(
      apiEndpoints.schedules,
      request
    ),
  update: (id: number, request: UpdateScheduleRequest) =>
    httpClient.put<ScheduleResponse, UpdateScheduleRequest>(
      `${apiEndpoints.schedules}/${id}`,
      request
    ),
} as const;
