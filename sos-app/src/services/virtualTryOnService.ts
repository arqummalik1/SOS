import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError, toApiError } from '../api/errors';
import { VirtualTryOn } from '../models/VirtualTryOn.model';
import { resolveProfileMediaUrl } from '../utils/resolveProfileMediaUrl';
import { logSosError } from '../utils/logSosError';

const LOG = '[SOS_VIRTUAL_TRYON]';

type ApiRow = Record<string, unknown>;

const toStr = (v: unknown): string => (v == null ? '' : String(v));

const toNumOrNull = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toBool = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1' || v === 'true') return true;
  return false;
};

const resolveUrl = (v: unknown): string | null => {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  return resolveProfileMediaUrl(s) ?? (s.startsWith('http') ? s : null);
};

const mapRowToVirtualTryOn = (row: ApiRow): VirtualTryOn => ({
  id: toStr(row.id),
  outfitId: row.outfit_id != null ? toStr(row.outfit_id) : null,
  wardrobeItemId: row.wardrobe_item_id != null ? toStr(row.wardrobe_item_id) : null,
  category: toStr(row.category).trim() || 'auto',
  mode: toStr(row.mode).trim() || 'balanced',
  status: toStr(row.status).trim() || 'pending',
  modelImageUrl: resolveUrl(row.model_image_url),
  garmentImageUrl: resolveUrl(row.garment_image_url),
  resultImageUrl: resolveUrl(row.result_image_url),
  processedResultImageUrl: resolveUrl(row.processed_result_image_url),
  reaction: row.reaction === 'liked' || row.reaction === 'disliked' ? row.reaction : null,
  rating: toNumOrNull(row.rating),
  isSavedToLookbook: toBool(row.is_saved_to_lookbook ?? row.isSavedToLookbook),
  savedToLookbookAt: row.saved_to_lookbook_at == null ? null : toStr(row.saved_to_lookbook_at),
  scheduledFor: row.scheduled_for == null ? null : toStr(row.scheduled_for),
  regeneratedFromId: row.regenerated_from_id != null ? toStr(row.regenerated_from_id) : null,
  regeneratedAsId: row.regenerated_as_id != null ? toStr(row.regenerated_as_id) : null,
  isRegenerated: toBool(row.is_regenerated ?? row.isRegenerated),
  processingStartedAt: row.processing_started_at == null ? null : toStr(row.processing_started_at),
  processingCompletedAt: row.processing_completed_at == null ? null : toStr(row.processing_completed_at),
  createdAt: row.created_at == null ? null : toStr(row.created_at),
  retryCount: row.retry_count != null ? Number(row.retry_count) : undefined,
  raw: row,
});

const unwrapEnvelopeData = (payload: unknown): unknown => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
};

const parseSingle = (payload: unknown): VirtualTryOn | null => {
  const inner = unwrapEnvelopeData(payload);
  if (!inner || typeof inner !== 'object') return null;
  return mapRowToVirtualTryOn(inner as ApiRow);
};

const parseList = (payload: unknown): VirtualTryOn[] => {
  const inner = unwrapEnvelopeData(payload);
  if (!inner || typeof inner !== 'object') return [];
  const o = inner as Record<string, unknown>;
  const rows = Array.isArray(o.data) ? (o.data as ApiRow[]) : Array.isArray(inner) ? (inner as ApiRow[]) : [];
  return rows.map(mapRowToVirtualTryOn);
};

export type VirtualTryOnCategory = 'tops' | 'bottoms' | 'one-piece' | 'auto';
export type VirtualTryOnMode = 'balanced' | 'quality';

export type InitiateVirtualTryOnBody = {
  wardrobe_item_id?: number;
  outfit_id?: number;
  category?: VirtualTryOnCategory;
  mode?: VirtualTryOnMode;
};

export const mapLabelToTryOnCategory = (label: string | undefined | null): VirtualTryOnCategory => {
  const s = (label ?? '').toLowerCase();
  if (s.includes('bottom') || s.includes('pant') || s.includes('skirt')) return 'bottoms';
  if (s.includes('dress') || s.includes('jumpsuit') || s.includes('one')) return 'one-piece';
  if (s.includes('top') || s.includes('shirt') || s.includes('tee') || s.includes('jacket')) return 'tops';
  return 'auto';
};

export const initiateVirtualTryOn = async (body: InitiateVirtualTryOnBody): Promise<VirtualTryOn> => {
  if (!body.wardrobe_item_id && body.outfit_id == null) {
    throw new ApiError({
      code: 'VALIDATION_ERROR',
      message: 'Choose a wardrobe item or outfit to start a virtual try-on.',
      status: 400,
    });
  }
  try {
    const payload = await apiClient.post<unknown>(API_ENDPOINTS.virtualTryOn.collection, body);
    const row = parseSingle(payload);
    if (!row) {
      throw new ApiError({ code: 'UNKNOWN_ERROR', message: 'Unexpected try-on response.', status: 502 });
    }
    return row;
  } catch (e) {
    logSosError(LOG, 'initiateVirtualTryOn', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export const getVirtualTryOn = async (id: string | number): Promise<VirtualTryOn> => {
  try {
    const payload = await apiClient.get<unknown>(API_ENDPOINTS.virtualTryOn.byId(id));
    const row = parseSingle(payload);
    if (!row) {
      throw new ApiError({ code: 'UNKNOWN_ERROR', message: 'Unexpected try-on response.', status: 502 });
    }
    return row;
  } catch (e) {
    logSosError(LOG, 'getVirtualTryOn', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export const listVirtualTryOns = async (params?: { page?: number }): Promise<VirtualTryOn[]> => {
  try {
    const payload = await apiClient.get<unknown>(API_ENDPOINTS.virtualTryOn.collection, {
      query: params?.page != null ? { page: params.page } : undefined,
    });
    return parseList(payload);
  } catch (e) {
    logSosError(LOG, 'listVirtualTryOns', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export const deleteVirtualTryOn = async (id: string | number): Promise<void> => {
  try {
    await apiClient.delete<unknown>(API_ENDPOINTS.virtualTryOn.byId(id));
  } catch (e) {
    logSosError(LOG, 'deleteVirtualTryOn', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export type VirtualTryOnReaction = 'liked' | 'disliked' | null;

export const reactVirtualTryOn = async (
  id: string | number,
  reaction: VirtualTryOnReaction
): Promise<VirtualTryOn> => {
  try {
    const payload = await apiClient.post<unknown>(API_ENDPOINTS.virtualTryOn.react(id), { reaction });
    const row = parseSingle(payload);
    if (!row) {
      throw new ApiError({ code: 'UNKNOWN_ERROR', message: 'Unexpected try-on response.', status: 502 });
    }
    return row;
  } catch (e) {
    logSosError(LOG, 'reactVirtualTryOn', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export const rateVirtualTryOn = async (id: string | number, rating: number | null): Promise<VirtualTryOn> => {
  try {
    const payload = await apiClient.post<unknown>(API_ENDPOINTS.virtualTryOn.rate(id), { rating });
    const row = parseSingle(payload);
    if (!row) {
      throw new ApiError({ code: 'UNKNOWN_ERROR', message: 'Unexpected try-on response.', status: 502 });
    }
    return row;
  } catch (e) {
    logSosError(LOG, 'rateVirtualTryOn', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export type RegenerateVirtualTryOnBody = {
  category?: VirtualTryOnCategory;
  mode?: VirtualTryOnMode;
};

export const regenerateVirtualTryOn = async (
  id: string | number,
  body?: RegenerateVirtualTryOnBody
): Promise<VirtualTryOn> => {
  try {
    const payload = await apiClient.post<unknown>(API_ENDPOINTS.virtualTryOn.regenerate(id), body ?? {});
    const row = parseSingle(payload);
    if (!row) {
      throw new ApiError({ code: 'UNKNOWN_ERROR', message: 'Unexpected try-on response.', status: 502 });
    }
    return row;
  } catch (e) {
    logSosError(LOG, 'regenerateVirtualTryOn', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export const saveVirtualTryOnToLookbook = async (id: string | number): Promise<VirtualTryOn> => {
  try {
    const payload = await apiClient.post<unknown>(API_ENDPOINTS.virtualTryOn.lookbook(id), {});
    const row = parseSingle(payload);
    if (!row) {
      throw new ApiError({ code: 'UNKNOWN_ERROR', message: 'Unexpected try-on response.', status: 502 });
    }
    return row;
  } catch (e) {
    logSosError(LOG, 'saveVirtualTryOnToLookbook', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};

export const scheduleVirtualTryOn = async (id: string | number, scheduledFor: string): Promise<VirtualTryOn> => {
  try {
    const payload = await apiClient.post<unknown>(API_ENDPOINTS.virtualTryOn.schedule(id), { scheduled_for: scheduledFor });
    const row = parseSingle(payload);
    if (!row) {
      throw new ApiError({ code: 'UNKNOWN_ERROR', message: 'Unexpected try-on response.', status: 502 });
    }
    return row;
  } catch (e) {
    logSosError(LOG, 'scheduleVirtualTryOn', e);
    throw e instanceof ApiError ? e : toApiError(e);
  }
};
