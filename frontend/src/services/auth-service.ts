import { apiEndpoints } from "@/config/api";
import { httpClient } from "@/services/http-client";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshRequest,
  RefreshResponse,
} from "@/types/auth";

export const authService = {
  login: (request: LoginRequest) =>
    httpClient.post<LoginResponse, LoginRequest>(
      apiEndpoints.auth.login,
      request,
      {
        auth: false,
        retryOnUnauthorized: false,
      }
    ),
  refresh: (request: RefreshRequest) =>
    httpClient.post<RefreshResponse, RefreshRequest>(
      apiEndpoints.auth.refresh,
      request,
      {
        auth: false,
        retryOnUnauthorized: false,
      }
    ),
  logout: (request: LogoutRequest) =>
    httpClient.post<void, LogoutRequest>(apiEndpoints.auth.logout, request, {
      retryOnUnauthorized: false,
    }),
  me: () => httpClient.get<AuthenticatedUser>(apiEndpoints.auth.me),
} as const;
