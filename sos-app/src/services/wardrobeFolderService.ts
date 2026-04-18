import { apiClient } from '../api/client';
import { API_CONFIG, buildApiUrl } from '../api/config';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError, toApiError } from '../api/errors';
import { WardrobeFolder, WardrobeFolderItem } from '../models/WardrobeFolder.model';
import { resolveProfileMediaUrl } from '../utils/resolveProfileMediaUrl';

const LOG = '[SOS_WARDROBE_FOLDERS]';

const shouldUseMock = (): boolean => API_CONFIG.isUsingFallbackBaseUrl;

type ApiFolderRaw = Record<string, unknown>;

const toStr = (v: unknown): string => (v == null ? '' : String(v));

const pickCount = (row: ApiFolderRaw): number => {
  const candidates = [row.items_count, row.item_count, row.itemsCount, row.count];
  for (const c of candidates) {
    const n = typeof c === 'number' ? c : Number(c);
    if (!Number.isNaN(n) && n >= 0) {
      return Math.floor(n);
    }
  }
  if (Array.isArray(row.items)) {
    return row.items.length;
  }
  return 0;
};

const mapFolderRow = (row: ApiFolderRaw): WardrobeFolder => {
  const id = toStr(row.id ?? row._id);
  const name = toStr(row.name).trim() || 'Untitled';
  const description = toStr(row.description).trim();
  const colorCode = toStr(row.color_code ?? row.colorCode ?? '#A580A6').trim() || '#A580A6';
  const orderRaw = row.order ?? row.sort_order ?? 0;
  const order = typeof orderRaw === 'number' ? orderRaw : Number(orderRaw) || 0;
  const featureUrl =
    resolveProfileMediaUrl(
      (row.processed_feature_image_url as string | undefined) ??
        (row.processedFeatureImageUrl as string | undefined) ??
        (row.processed_feature_image as string | undefined) ??
        (row.processedFeatureImage as string | undefined) ??
        (row.feature_image_url as string | undefined) ??
        (row.feature_image as string | undefined)
    ) ?? null;
  const aiStatus = toStr(row.feature_image_ai_status ?? row.featureImageAiStatus) || null;

  return {
    id,
    name,
    description,
    colorCode,
    order,
    itemCount: pickCount(row),
    featureImageUrl: featureUrl,
    featureImageAiStatus: aiStatus,
  };
};

const unwrapFolderArray = (payload: unknown): ApiFolderRaw[] => {
  if (Array.isArray(payload)) {
    return payload as ApiFolderRaw[];
  }
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) {
      return o.data as ApiFolderRaw[];
    }
    const inner = o.data;
    if (inner && typeof inner === 'object') {
      const d = inner as Record<string, unknown>;
      if (Array.isArray(d.folders)) {
        return d.folders as ApiFolderRaw[];
      }
      if (Array.isArray(d.items)) {
        return [];
      }
    }
  }
  return [];
};

const unwrapEnvelope = <T>(response: unknown): T | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }
  const r = response as Record<string, unknown>;
  if ('data' in r && r.data !== undefined) {
    return r.data as T;
  }
  return response as T;
};

const mapItemRow = (row: ApiFolderRaw): WardrobeFolderItem => {
  const id = toStr(row.id ?? row._id);
  const name = toStr(row.name ?? row.title).trim() || 'Item';
  const uri =
    resolveProfileMediaUrl(
      (row.processed_image_url as string | undefined) ??
        (row.processedImageUrl as string | undefined) ??
        (row.processed_image as string | undefined) ??
        (row.processedImage as string | undefined) ??
        (row.original_image_url as string | undefined) ??
        (row.originalImageUrl as string | undefined) ??
        (row.original_image as string | undefined) ??
        (row.image_url as string | undefined) ??
        (row.thumbnail_url as string | undefined) ??
        (row.image as string | undefined) ??
        (row.photo_url as string | undefined)
    ) ?? null;
  return {
    id,
    name,
    imageUri: uri,
    category: toStr(row.category ?? row.type),
    color: toStr(row.color ?? row.color_code),
    raw: row,
  };
};

const parseFolderDetail = (
  payload: unknown
): { folder: WardrobeFolder; items: WardrobeFolderItem[] } | null => {
  const data = unwrapEnvelope<unknown>(payload);
  if (!data || typeof data !== 'object') {
    return null;
  }
  const d = data as Record<string, unknown>;

  let folderRaw: ApiFolderRaw | null = null;
  let itemsRaw: ApiFolderRaw[] = [];

  if ('folder' in d && d.folder && typeof d.folder === 'object') {
    folderRaw = d.folder as ApiFolderRaw;
    const items = d.items ?? d.wardrobe_items ?? d.products;
    if (Array.isArray(items)) {
      itemsRaw = items as ApiFolderRaw[];
    }
  } else if (Array.isArray(d.items)) {
    folderRaw = d as ApiFolderRaw;
    itemsRaw = d.items as ApiFolderRaw[];
  }

  if (!folderRaw && itemsRaw.length === 0) {
    return null;
  }

  if (!folderRaw && itemsRaw.length) {
    return {
      folder: {
        id: '',
        name: 'Folder',
        description: '',
        colorCode: '#A580A6',
        order: 0,
        itemCount: itemsRaw.length,
        featureImageUrl: null,
        featureImageAiStatus: null,
      },
      items: itemsRaw.map(mapItemRow),
    };
  }

  if (!folderRaw) {
    return null;
  }

  return {
    folder: mapFolderRow(folderRaw),
    items: itemsRaw.map(mapItemRow),
  };
};

export type CreateWardrobeFolderInput = {
  name: string;
  description: string;
  color_code: string;
  order?: number;
};

export type UpdateWardrobeFolderInput = {
  name: string;
  description: string;
  color_code: string;
  order: number;
};

export const wardrobeFolderService = {
  async listFolders(): Promise<WardrobeFolder[]> {
    if (shouldUseMock()) {
      console.log(`${LOG} listFolders skipped (mock mode)`);
      return [];
    }

    const url = buildApiUrl(API_ENDPOINTS.wardrobe.folders);
    console.log(`${LOG} GET folders`, { url });

    try {
      const response = await apiClient.get<unknown>(API_ENDPOINTS.wardrobe.folders);
      const rows = unwrapFolderArray(response);
      const mapped = rows.map(mapFolderRow).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      console.log(`${LOG} GET folders OK`, { count: mapped.length });
      return mapped;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${LOG} GET folders failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
        });
      } else {
        console.error(`${LOG} GET folders failed`, error);
      }
      throw error;
    }
  },

  async getFolderDetails(folderId: string): Promise<{ folder: WardrobeFolder; items: WardrobeFolderItem[] }> {
    if (shouldUseMock()) {
      return {
        folder: {
          id: folderId,
          name: 'Folder',
          description: '',
          colorCode: '#A580A6',
          order: 0,
          itemCount: 0,
          featureImageUrl: null,
          featureImageAiStatus: null,
        },
        items: [],
      };
    }

    const path = `${API_ENDPOINTS.wardrobe.folders}/${encodeURIComponent(folderId)}`;
    const url = buildApiUrl(path);
    console.log(`${LOG} GET folder details`, { url });

    try {
      const response = await apiClient.get<unknown>(path);
      const parsed = parseFolderDetail(response);
      if (!parsed) {
        throw toApiError(new Error('Invalid folder payload'), 'Could not read folder details from the server.');
      }
      if (!parsed.folder.id) {
        parsed.folder = { ...parsed.folder, id: folderId };
      }
      console.log(`${LOG} GET folder details OK`, {
        folderId: parsed.folder.id,
        items: parsed.items.length,
      });
      return parsed;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${LOG} GET folder details failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
        });
      } else {
        console.error(`${LOG} GET folder details failed`, error);
      }
      throw error;
    }
  },

  /**
   * POST `/wardrobe/folders` — includes `feature_image_ai_status: 'pending'` so MySQL NOT NULL
   * constraint (seen in production traces) is satisfied when the API forwards it.
   */
  async createFolder(input: CreateWardrobeFolderInput): Promise<WardrobeFolder> {
    if (shouldUseMock()) {
      return mapFolderRow({
        id: 'mock',
        name: input.name,
        description: input.description,
        color_code: input.color_code,
        order: input.order ?? 0,
        items_count: 0,
        feature_image_ai_status: 'pending',
      });
    }

    // Backend must persist these into the INSERT; some deployments omit them and MySQL
    // rejects NULL on NOT NULL columns (e.g. `feature_image_ai_status`). We send explicit
    // defaults so any fillable mass-assignment picks them up.
    const body: Record<string, unknown> = {
      name: input.name.trim(),
      description: input.description.trim(),
      color_code: input.color_code.trim(),
      order: input.order ?? 0,
      feature_image_ai_status: 'pending',
      feature_image: '',
      processed_feature_image: '',
    };

    const url = buildApiUrl(API_ENDPOINTS.wardrobe.folders);
    console.log(`${LOG} POST folders`, { url, keys: Object.keys(body) });

    try {
      const response = await apiClient.post<unknown>(API_ENDPOINTS.wardrobe.folders, body);
      const data = unwrapEnvelope<ApiFolderRaw>(response);
      if (data && typeof data === 'object' && (data as ApiFolderRaw).id != null) {
        return mapFolderRow(data as ApiFolderRaw);
      }
      const inner = (response as Record<string, unknown>)?.data;
      if (inner && typeof inner === 'object' && (inner as ApiFolderRaw).folder) {
        return mapFolderRow((inner as { folder: ApiFolderRaw }).folder);
      }
      const list = await wardrobeFolderService.listFolders();
      const found = list.find((f) => f.name === input.name.trim());
      if (found) {
        return found;
      }
      throw toApiError(
        new Error('Missing folder in create response'),
        'Folder may have been created. Pull to refresh the list.'
      );
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${LOG} POST folders failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
        });
      } else {
        console.error(`${LOG} POST folders failed`, error);
      }
      throw error;
    }
  },

  async updateFolder(folderId: string, input: UpdateWardrobeFolderInput): Promise<WardrobeFolder> {
    if (shouldUseMock()) {
      return mapFolderRow({
        id: folderId,
        name: input.name,
        description: input.description,
        color_code: input.color_code,
        order: input.order,
      });
    }

    const path = `${API_ENDPOINTS.wardrobe.folders}/${encodeURIComponent(folderId)}`;
    const body = {
      name: input.name.trim(),
      description: input.description.trim(),
      color_code: input.color_code.trim(),
      order: input.order,
    };

    console.log(`${LOG} PUT folder`, { path: buildApiUrl(path) });

    try {
      const response = await apiClient.put<unknown>(path, body);
      const data = unwrapEnvelope<ApiFolderRaw>(response);
      if (data && typeof data === 'object' && (data as ApiFolderRaw).id != null) {
        return mapFolderRow(data as ApiFolderRaw);
      }
      const detail = await wardrobeFolderService.getFolderDetails(folderId);
      return detail.folder;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${LOG} PUT folder failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
        });
      } else {
        console.error(`${LOG} PUT folder failed`, error);
      }
      throw error;
    }
  },

  async deleteFolder(folderId: string): Promise<void> {
    if (shouldUseMock()) {
      return;
    }

    const path = `${API_ENDPOINTS.wardrobe.folders}/${encodeURIComponent(folderId)}`;
    console.log(`${LOG} DELETE folder`, { path: buildApiUrl(path) });

    try {
      await apiClient.delete(path);
      console.log(`${LOG} DELETE folder OK`, { folderId });
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${LOG} DELETE folder failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
        });
      } else {
        console.error(`${LOG} DELETE folder failed`, error);
      }
      throw error;
    }
  },
};
