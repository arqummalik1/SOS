export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'PAYLOAD_TOO_LARGE'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly details?: unknown;
  readonly isRetryable: boolean;

  constructor(params: {
    message: string;
    code: ApiErrorCode;
    status?: number;
    details?: unknown;
    isRetryable?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
    this.isRetryable = Boolean(params.isRetryable);
  }
}

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const CORS_ERROR_HINT =
  'Request blocked by browser security (CORS). Please allow your app origin on backend.';

/**
 * Maps known 5xx payload shapes (e.g. Laravel SQL wrapped in `data.error`) to safe copy.
 * Raw SQL is never shown to the user.
 */
const userSafeMessageFromServerPayload = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== 'object') {
    return undefined;
  }
  const err = (data as Record<string, unknown>).error;
  if (typeof err !== 'string' || !err.trim()) {
    return undefined;
  }
  const lower = err.toLowerCase();
  if (lower.includes('feature_image_ai_status') && lower.includes('cannot be null')) {
    return 'The server could not save this folder (image status field). This is a backend configuration issue — not something you did wrong. Please try again later or contact support.';
  }
  if (lower.includes('sqlstate') && (lower.includes('integrity constraint') || lower.includes('cannot be null'))) {
    return 'The server rejected this save because of a data rule. Please try again or contact support if it continues.';
  }
  return undefined;
};

const GENERIC_SERVER_MESSAGES = new Set(
  ['validation error', 'the given data was invalid.', 'bad request'].map((s) => s.toLowerCase())
);

const firstStringFromFieldBag = (bag: unknown): string | undefined => {
  if (!bag || typeof bag !== 'object') {
    return undefined;
  }
  for (const value of Object.values(bag as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const hit = value.find((v) => typeof v === 'string' && v.trim().length > 0);
      if (typeof hit === 'string') {
        return hit.trim();
      }
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const extractServerMessage = (payload: unknown, depth = 0): string | undefined => {
  if (!payload || typeof payload !== 'object' || depth > 6) {
    return undefined;
  }

  const source = payload as Record<string, unknown>;

  const fromErrors = firstStringFromFieldBag(source.errors);
  if (fromErrors) {
    return fromErrors;
  }

  const data = source.data;
  if (data && typeof data === 'object') {
    const fromDataFields = firstStringFromFieldBag(data);
    if (fromDataFields) {
      return fromDataFields;
    }
    const entries = Object.values(data as Record<string, unknown>);
    for (const value of entries) {
      if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim().length > 0) {
        return value[0].trim();
      }
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }

  const candidate = source.message ?? source.error ?? source.detail;
  let isGeneric = false;

  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    const normalized = candidate.trim();
    if (!GENERIC_SERVER_MESSAGES.has(normalized.toLowerCase())) {
      return normalized;
    }
    isGeneric = true;
  }

  const details = source.details;
  if (details && typeof details === 'object') {
    const nested = extractServerMessage(details, depth + 1);
    if (nested) {
      return nested;
    }
  }

  if (isGeneric) {
    return undefined;
  }

  return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate.trim() : undefined;
};

/** Nginx / proxies often return HTML bodies for 413 instead of JSON. */
const messageFromNonJsonPayload = (payload: unknown): string | undefined => {
  if (typeof payload !== 'string' || !payload.trim()) {
    return undefined;
  }
  const lower = payload.toLowerCase();
  if (lower.includes('413') && lower.includes('entity too large')) {
    return 'This photo is too large for the server. Try choosing a smaller image or retake your photo.';
  }
  return undefined;
};

export const toApiError = (
  input: unknown,
  fallbackMessage: string = DEFAULT_ERROR_MESSAGE
): ApiError => {
  if (input instanceof ApiError) {
    return input;
  }

  if (input instanceof Error && input.name === 'AbortError') {
    return new ApiError({
      code: 'TIMEOUT',
      message: 'Request timed out. Please try again.',
      isRetryable: true,
      details: input,
    });
  }

  if (input instanceof TypeError) {
    const message = input.message?.toLowerCase() ?? '';
    const isLikelyCors =
      message.includes('failed to fetch') && typeof window !== 'undefined';
    return new ApiError({
      code: 'NETWORK_ERROR',
      message: isLikelyCors
        ? CORS_ERROR_HINT
        : 'Unable to reach server. Check your connection.',
      isRetryable: true,
      details: input,
    });
  }

  if (input instanceof Error) {
    return new ApiError({
      code: 'UNKNOWN_ERROR',
      message: input.message || fallbackMessage,
      details: input,
    });
  }

  return new ApiError({
    code: 'UNKNOWN_ERROR',
    message: fallbackMessage,
    details: input,
  });
};

export const toHttpStatusError = (status: number, payload: unknown): ApiError => {
  const serverMessage = extractServerMessage(payload) ?? messageFromNonJsonPayload(payload);
  const details = payload;

  if (status === 413) {
    return new ApiError({
      code: 'PAYLOAD_TOO_LARGE',
      status,
      message:
        serverMessage ??
        'This photo is too large to upload. Try a smaller image or lower camera quality.',
      details,
    });
  }

  if (status === 401) {
    return new ApiError({
      code: 'UNAUTHORIZED',
      status,
      message: serverMessage ?? 'Session expired. Please sign in again.',
      details,
    });
  }

  if (status === 403) {
    return new ApiError({
      code: 'FORBIDDEN',
      status,
      message: serverMessage ?? 'You are not allowed to perform this action.',
      details,
    });
  }

  if (status === 404) {
    return new ApiError({
      code: 'NOT_FOUND',
      status,
      message: serverMessage ?? 'Requested resource was not found.',
      details,
    });
  }

  if (status >= 400 && status < 500) {
    return new ApiError({
      code: 'VALIDATION_ERROR',
      status,
      message: serverMessage ?? 'Please check your input and try again.',
      details,
    });
  }

  if (status >= 500) {
    const friendly = userSafeMessageFromServerPayload(payload);
    return new ApiError({
      code: 'SERVER_ERROR',
      status,
      message: friendly ?? 'Server error. Please try again later.',
      details,
      isRetryable: true,
    });
  }

  return new ApiError({
    code: 'UNKNOWN_ERROR',
    status,
    message: serverMessage ?? DEFAULT_ERROR_MESSAGE,
    details,
  });
};
