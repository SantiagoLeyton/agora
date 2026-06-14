const DEFAULT_API_URL = "http://localhost:8080";
const API_V1_PREFIX = "/api/v1";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export const apiConfig = {
  baseUrl: normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
  ),
  apiPrefix: API_V1_PREFIX,
} as const;

export const apiEndpoints = {
  health: "/actuator/health",
  auth: {
    login: `${API_V1_PREFIX}/auth/login`,
    refresh: `${API_V1_PREFIX}/auth/refresh`,
    logout: `${API_V1_PREFIX}/auth/logout`,
    me: `${API_V1_PREFIX}/auth/me`,
  },
  users: `${API_V1_PREFIX}/users`,
  roles: `${API_V1_PREFIX}/roles`,
  cases: `${API_V1_PREFIX}/cases`,
  simulations: `${API_V1_PREFIX}/simulations`,
  attempts: `${API_V1_PREFIX}/attempts`,
  groups: `${API_V1_PREFIX}/groups`,
  schedules: `${API_V1_PREFIX}/schedules`,
  gradebook: `${API_V1_PREFIX}/gradebook`,
} as const;

export function buildApiUrl(path: string, baseUrl = apiConfig.baseUrl): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
