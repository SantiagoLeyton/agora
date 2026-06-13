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

export interface ForgotPasswordResponse {
  mensaje: string;
  tokenDesarrollo?: string | null;
  enlaceDesarrollo?: string | null;
}

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
  forgotPassword: (correo: string) =>
    httpClient.post<ForgotPasswordResponse, { correo: string }>(
      "/api/v1/auth/forgot-password",
      { correo },
      { auth: false, retryOnUnauthorized: false }
    ),
  resetPassword: (token: string, password: string) =>
    httpClient.post<void, { token: string; password: string }>(
      "/api/v1/auth/reset-password",
      { token, password },
      { auth: false, retryOnUnauthorized: false }
    ),
} as const;
