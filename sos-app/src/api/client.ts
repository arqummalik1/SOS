import { API_CONFIG, buildApiUrl } from './config';
import { API_ENDPOINTS } from './endpoints';
import { ApiError, toApiError, toHttpStatusError } from './errors';
import { tokenManager } from './tokenManager';
import { ApiRequestOptions, HttpMethod, QueryParams } from './types';

console.log('[SOS_API] Resolved config', {
  baseUrl: API_CONFIG.baseUrl,
  timeoutMs: API_CONFIG.timeoutMs,
  isUsingFallbackBaseUrl: API_CONFIG.isUsingFallbackBaseUrl,
});

type InternalRequestOptions = ApiRequestOptions & {
  __isRetryAfterRefresh?: boolean;
};

type RefreshResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
};

let refreshPromise: Promise<string | null> | null = null;

const logApi = (level: 'info' | 'error', message: string, meta?: Record<string, unknown>) => {
  const lower = message.toLowerCase();
  const icon =
    level === 'error'
      ? '❌'
      : lower.includes('request')
        ? '🛜'
        : lower.includes('response')
          ? '📥'
          : 'ℹ️';
  const outputMessage = `${icon} [SOS_API] ${message}`;

  if (level === 'error') {
    if (meta) {
      console.error(outputMessage, meta);
      return;
    }
    console.error(outputMessage);
  } else {
    if (meta) {
      console.log(outputMessage, meta);
      return;
    }
    console.log(outputMessage);
  }
};

const resolveMethod = (method?: HttpMethod): HttpMethod => method ?? 'GET';

const isBodyAllowed = (method: HttpMethod): boolean => method !== 'GET' && method !== 'DELETE';
const isFormDataBody = (value: unknown): value is FormData =>
  typeof FormData !== 'undefined' && value instanceof FormData;

const createTimeoutSignal = (
  timeoutMs: number,
  externalSignal?: AbortSignal
): { signal?: AbortSignal; cleanup: () => void } => {
  if (!timeoutMs && !externalSignal) {
    return { cleanup: () => undefined };
  }

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
};

const buildQueryString = (params?: QueryParams): string => {
  if (!params) {
    return '';
  }

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    search.append(key, String(value));
  });

  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
};

const normalizeEndpointPath = (endpoint: string): string => endpoint.split('?')[0] ?? endpoint;

const resolveEndpointLabel = (endpoint: string): string => {
  const path = normalizeEndpointPath(endpoint).toLowerCase();
  if (path.startsWith('/wardrobe/folders')) return 'Wardrobe Folders';
  if (path.startsWith('/wardrobe/items')) return 'Wardrobe Items';
  if (path.startsWith('/wardrobe/search')) return 'Wardrobe Search';
  if (path.startsWith('/wardrobe/outfits')) return 'Wardrobe Outfits';
  if (path.startsWith('/wardrobe/saved-outfits')) return 'Wardrobe Saved Outfits';
  if (path.startsWith('/wardrobe')) return 'Wardrobe';
  if (path.startsWith('/auth')) return 'Auth';
  if (path.startsWith('/onboarding')) return 'Onboarding';
  if (path.startsWith('/profile')) return 'Profile';
  if (path.startsWith('/users')) return 'Users';
  if (path.startsWith('/virtual-tryon')) return 'Virtual Try-On';
  if (path.startsWith('/payments')) return 'Payments';
  if (path.startsWith('/logout')) return 'Session';
  return 'General API';
};

const buildRequestLogLabel = (method: HttpMethod, endpoint: string): string =>
  `[${resolveEndpointLabel(endpoint)}] ${method} ${normalizeEndpointPath(endpoint)} request`;

const buildResponseLogLabel = (
  method: HttpMethod,
  endpoint: string,
  kind: 'success' | 'error'
): string =>
  `[${resolveEndpointLabel(endpoint)}] ${method} ${normalizeEndpointPath(endpoint)} ${
    kind === 'success' ? 'response' : 'error'
  }`;

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
};

const shouldTryRefresh = (params: {
  status: number;
  options: InternalRequestOptions;
  endpoint: string;
}): boolean => {
  const { status, options, endpoint } = params;
  if (status !== 401) {
    return false;
  }
  if (options.skipAuth) {
    return false;
  }
  if (options.__isRetryAfterRefresh) {
    return false;
  }
  if (endpoint === API_ENDPOINTS.auth.refreshToken) {
    return false;
  }
  return true;
};

const getRefreshTokenBody = (token: string) => ({
  refreshToken: token,
});

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await tokenManager.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const timeoutHandle = createTimeoutSignal(API_CONFIG.timeoutMs);
    const refreshUrl = buildApiUrl(API_ENDPOINTS.auth.refreshToken);
    const refreshBody = getRefreshTokenBody(refreshToken);
    try {
      logApi('info', buildRequestLogLabel('POST', API_ENDPOINTS.auth.refreshToken), {
        url: refreshUrl,
        skipAuth: true,
        bodyType: 'json',
        requestData: refreshBody,
      });
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refreshBody),
        signal: timeoutHandle.signal,
      });

      const payload = (await parseResponseBody(response)) as RefreshResponse | { data?: RefreshResponse } | null;
      if (!response.ok) {
        logApi('error', buildResponseLogLabel('POST', API_ENDPOINTS.auth.refreshToken, 'error'), {
          url: refreshUrl,
          status: response.status,
          responseData: payload,
        });
        await tokenManager.clearTokens();
        return null;
      }
      logApi('info', buildResponseLogLabel('POST', API_ENDPOINTS.auth.refreshToken, 'success'), {
        url: refreshUrl,
        status: response.status,
        responseData: payload,
      });

      const normalized: RefreshResponse | null =
        payload && typeof payload === 'object' && 'data' in payload && payload.data
          ? payload.data
          : (payload as RefreshResponse | null);
      if (!normalized) {
        await tokenManager.clearTokens();
        return null;
      }

      const nextAccessToken = normalized.accessToken ?? normalized.token ?? null;
      const nextRefreshToken = normalized.refreshToken ?? refreshToken;
      if (!nextAccessToken) {
        await tokenManager.clearTokens();
        return null;
      }

      await tokenManager.setTokens({
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });
      return nextAccessToken;
    } catch (error) {
      const normalized = toApiError(error);
      logApi('error', buildResponseLogLabel('POST', API_ENDPOINTS.auth.refreshToken, 'error'), {
        url: refreshUrl,
        code: normalized.code,
        message: normalized.message,
      });
      await tokenManager.clearTokens();
      throw normalized;
    } finally {
      timeoutHandle.cleanup();
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const request = async <T>(endpoint: string, options: InternalRequestOptions = {}): Promise<T> => {
  const method = resolveMethod(options.method);
  const timeout = options.timeoutMs ?? API_CONFIG.timeoutMs;
  const timeoutHandle = createTimeoutSignal(timeout, options.signal);
  const url = `${buildApiUrl(endpoint)}${buildQueryString(options.query)}`;

  try {
    const authHeaders: Record<string, string> = {};
    if (!options.skipAuth) {
      const accessToken = await tokenManager.getAccessToken();
      if (accessToken) {
        authHeaders.Authorization = `Bearer ${accessToken}`;
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...authHeaders,
      ...(options.headers ?? {}),
    };

    const hasBody = options.body !== undefined && isBodyAllowed(method);
    const isFormData = isFormDataBody(options.body);

    if (hasBody && !isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    logApi('info', buildRequestLogLabel(method, endpoint), {
      url,
      skipAuth: Boolean(options.skipAuth),
      bodyType: hasBody ? (isFormData ? 'multipart/form-data' : 'json') : 'none',
      query: options.query ?? null,
      requestData: hasBody ? (options.body as unknown) : null,
    });

    const response = await fetch(url, {
      method,
      headers,
      body: hasBody ? (isFormData ? options.body as FormData : JSON.stringify(options.body)) : undefined,
      signal: timeoutHandle.signal,
    });

    const payload = await parseResponseBody(response);
    if (response.ok) {
      logApi('info', buildResponseLogLabel(method, endpoint, 'success'), {
        url,
        status: response.status,
        responseData: payload,
      });
      return (payload as T) ?? ({} as T);
    }

    if (shouldTryRefresh({ status: response.status, options, endpoint })) {
      logApi('info', `401 → attempting token refresh then retry`, { url });
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return request<T>(endpoint, { ...options, __isRetryAfterRefresh: true });
      }
    }

    const httpError = toHttpStatusError(response.status, payload);
    logApi('error', buildResponseLogLabel(method, endpoint, 'error'), {
      url,
      status: response.status,
      code: httpError.code,
      message: httpError.message,
      responseData: payload,
    });
    throw httpError;
  } catch (error) {
    const normalized = error instanceof ApiError ? error : toApiError(error);
    if (!(error instanceof ApiError)) {
      logApi('error', buildResponseLogLabel(method, endpoint, 'error'), {
        url,
        code: normalized.code,
        message: normalized.message,
        name: normalized.name,
      });
    }
    throw normalized;
  } finally {
    timeoutHandle.cleanup();
  }
};

export const apiClient = {
  request,
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),
  patch: <T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),
  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
