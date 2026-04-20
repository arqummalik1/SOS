const DEFAULT_API_BASE_URL = 'https://app.styleonspot.com/api/v1';
const DEFAULT_API_TIMEOUT_MS = 15000;

const normalizeBaseUrl = (value: string | undefined): string => {
  if (!value || !value.trim()) {
    return DEFAULT_API_BASE_URL;
  }

  return value.trim().replace(/\/+$/, '');
};

const parseTimeoutMs = (value: string | undefined): number => {
  if (value === undefined) {
    return DEFAULT_API_TIMEOUT_MS;
  }
  const parsed = Number(value);
  if (!isFinite(parsed) || parsed <= 0) {
    return DEFAULT_API_TIMEOUT_MS;
  }
  return parsed;
};

/**
 * Production currently returns 404 for `GET /wardrobe/outfits` and `GET /wardrobe/saved-outfits`
 * until those routes ship. Set `EXPO_PUBLIC_WARDROBE_OUTFIT_API_ENABLED=true` when the backend exposes them.
 */
export const wardrobeOutfitRemoteApiEnabled =
  process.env.EXPO_PUBLIC_WARDROBE_OUTFIT_API_ENABLED === 'true';

export const API_CONFIG = {
  baseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL),
  timeoutMs: parseTimeoutMs(process.env.EXPO_PUBLIC_API_TIMEOUT_MS),
  isUsingFallbackBaseUrl: !process.env.EXPO_PUBLIC_API_BASE_URL?.trim(),
} as const;

/** App origin without `/api/v1` (e.g. `https://app.styleonspot.com`). */
export const getAppOrigin = (): string =>
  API_CONFIG.baseUrl.replace(/\/api\/v1\/?$/i, '').replace(/\/+$/, '');

/**
 * Base for relative file keys from the API (Laravel-style `/storage/...`).
 * Set `EXPO_PUBLIC_STORAGE_BASE_URL` if files are served from a CDN or different host.
 */
export const getStoragePublicBase = (): string => {
  const explicit = process.env.EXPO_PUBLIC_STORAGE_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }
  return `${getAppOrigin()}/storage`;
};

/**
 * Join base + path. If `EXPO_PUBLIC_API_BASE_URL` already ends with `/api/v1`,
 * endpoint paths must not start with `/v1/` or the server returns 404 for
 * `/api/v1/v1/...` (verified against production).
 */
export const buildApiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${API_CONFIG.baseUrl}${normalizedPath}`;
  const beforeDedupe = url;
  url = url.replace(/\/api\/v1\/v1(\/|$)/g, '/api/v1$1');
  if (url !== beforeDedupe && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(
      '[SOS_API] Normalized duplicate /api/v1/v1 in URL. Use paths without a leading /v1 when base URL already includes /api/v1.',
      { before: beforeDedupe, after: url }
    );
  }
  return url;
};
