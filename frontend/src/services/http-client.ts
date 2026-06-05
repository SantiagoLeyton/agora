import { buildApiUrl } from "@/config/api";
import { ApiError, parseApiErrorPayload } from "@/services/api-error";
import { getAccessToken, refreshAccessToken } from "@/services/auth-token-provider";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestOptions<TBody = never>
  extends Omit<RequestInit, "body" | "headers" | "method"> {
  body?: TBody;
  headers?: HeadersInit;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

const JSON_CONTENT_TYPE = "application/json";

function isJsonResponse(response: Response): boolean {
  return response.headers.get("content-type")?.includes(JSON_CONTENT_TYPE) ?? false;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  if (isJsonResponse(response)) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}

function hasRequestBody<TBody>(body: TBody | undefined): body is TBody {
  return body !== undefined;
}

async function buildHeaders(
  options: HttpRequestOptions<unknown>
): Promise<Headers> {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", JSON_CONTENT_TYPE);
  }

  if (hasRequestBody(options.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", JSON_CONTENT_TYPE);
  }

  if (options.auth !== false) {
    const token = await getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

async function request<TResponse, TBody = never>(
  method: HttpMethod,
  path: string,
  options: HttpRequestOptions<TBody> = {}
): Promise<TResponse> {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    method,
    headers: await buildHeaders(options as HttpRequestOptions<unknown>),
    body: hasRequestBody(options.body) ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.retryOnUnauthorized !== false) {
    const token = await refreshAccessToken();
    if (token) {
      return request<TResponse, TBody>(method, path, {
        ...options,
        retryOnUnauthorized: false,
      });
    }
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorPayload(responseBody, response.status, response.statusText)
    );
  }

  return responseBody as TResponse;
}

export const httpClient = {
  get: <TResponse>(path: string, options?: HttpRequestOptions) =>
    request<TResponse>("GET", path, options),
  post: <TResponse, TBody = never>(
    path: string,
    body?: TBody,
    options?: HttpRequestOptions<TBody>
  ) => request<TResponse, TBody>("POST", path, { ...options, body }),
  put: <TResponse, TBody = never>(
    path: string,
    body?: TBody,
    options?: HttpRequestOptions<TBody>
  ) => request<TResponse, TBody>("PUT", path, { ...options, body }),
  patch: <TResponse, TBody = never>(
    path: string,
    body?: TBody,
    options?: HttpRequestOptions<TBody>
  ) => request<TResponse, TBody>("PATCH", path, { ...options, body }),
  delete: <TResponse>(path: string, options?: HttpRequestOptions) =>
    request<TResponse>("DELETE", path, options),
} as const;
