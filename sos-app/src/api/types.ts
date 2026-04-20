export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type ApiRequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  query?: QueryParams;
  skipAuth?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
  retryOnAuthFailure?: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};
