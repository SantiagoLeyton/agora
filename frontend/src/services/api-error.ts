export type ValidationErrors = Record<string, string>;

export interface ApiErrorPayload {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  validationErrors?: ValidationErrors;
}

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly timestamp?: string;
  readonly path?: string;
  readonly validationErrors?: ValidationErrors;
  readonly payload: ApiErrorPayload;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.error = payload.error;
    this.timestamp = payload.timestamp;
    this.path = payload.path;
    this.validationErrors = payload.validationErrors;
    this.payload = payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseValidationErrors(value: unknown): ValidationErrors | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.entries(value).reduce<ValidationErrors>((errors, [field, message]) => {
    if (typeof message === "string") {
      errors[field] = message;
    }
    return errors;
  }, {});
}

export function parseApiErrorPayload(
  value: unknown,
  fallbackStatus: number,
  fallbackStatusText: string
): ApiErrorPayload {
  if (!isRecord(value)) {
    return {
      status: fallbackStatus,
      error: fallbackStatusText || "HTTP Error",
      message: fallbackStatusText || "Request failed",
    };
  }

  return {
    timestamp: typeof value.timestamp === "string" ? value.timestamp : undefined,
    status: typeof value.status === "number" ? value.status : fallbackStatus,
    error: typeof value.error === "string" ? value.error : fallbackStatusText,
    message:
      typeof value.message === "string"
        ? value.message
        : fallbackStatusText || "Request failed",
    path: typeof value.path === "string" ? value.path : undefined,
    validationErrors: parseValidationErrors(value.validationErrors),
  };
}
