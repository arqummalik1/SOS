import { ApiError } from '../api/errors';

/**
 * Structured logs for screen-level flows (pairs with user-facing `notify`).
 * Use a stable prefix per feature, e.g. `[SOS_FOLDER_DETAIL]`.
 */
export function logSosError(
  logPrefix: string,
  operation: string,
  error: unknown,
  level: 'error' | 'warn' = 'error'
): void {
  const label = `${logPrefix} ${operation}`;
  if (error instanceof ApiError) {
    const meta = { code: error.code, status: error.status, message: error.message };
    if (level === 'warn') {
      console.warn(label, meta);
    } else {
      console.error(label, meta);
    }
    return;
  }
  if (level === 'warn') {
    console.warn(label, error);
  } else {
    console.error(label, error);
  }
}
