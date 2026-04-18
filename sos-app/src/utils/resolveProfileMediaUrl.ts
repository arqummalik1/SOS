import { getStoragePublicBase } from '../api/config';

/**
 * Builds a display URL for relative storage keys (e.g. `onboarding/profile/...`).
 * Absolute URLs are returned unchanged. Override with `EXPO_PUBLIC_STORAGE_BASE_URL` if CDN differs.
 */
export const resolveProfileMediaUrl = (value: string | null | undefined): string | null => {
  if (value == null || value === '') {
    return null;
  }
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base = getStoragePublicBase();
  const path = trimmed.replace(/^\/+/, '');
  return `${base}/${path}`;
};
