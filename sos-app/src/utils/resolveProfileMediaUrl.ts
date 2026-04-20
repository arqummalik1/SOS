import { getAppOrigin, getStoragePublicBase } from '../api/config';

/**
 * Builds a display URL for relative storage keys (e.g. `onboarding/profile/...`, `/storage/...`).
 * Absolute URLs are returned unchanged. Override with `EXPO_PUBLIC_STORAGE_BASE_URL` if CDN differs.
 *
 * Laravel often returns paths like `/storage/wardrobe/...`. Those must join to the **app origin**
 * once (`https://host/storage/...`). Joining them to `getStoragePublicBase()` (`.../storage`) would
 * duplicate `storage` (`.../storage/storage/...`) and break every image.
 */
export const resolveProfileMediaUrl = (value: string | null | undefined): string | null => {
  if (value == null || value === '') {
    return null;
  }
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/storage/') || trimmed === '/storage') {
    return `${getAppOrigin()}${trimmed}`;
  }
  const normalized = trimmed.replace(/^\/+/, '');
  if (/^storage\//i.test(normalized)) {
    return `${getAppOrigin()}/${normalized}`;
  }
  const base = getStoragePublicBase();
  return `${base}/${normalized}`;
};
