import { apiClient } from '../api/client';
import { API_CONFIG, buildApiUrl } from '../api/config';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError, toApiError } from '../api/errors';
import { QueryParams } from '../api/types';
import { WardrobeFolderItem } from '../models/WardrobeFolder.model';
import { WardrobeItem, WardrobeItemListFilters } from '../models/WardrobeItem.model';
import { prepareProfileImageForUpload } from '../utils/prepareProfileImageForUpload';
import { resolveProfileMediaUrl } from '../utils/resolveProfileMediaUrl';
import { logSosError } from '../utils/logSosError';

const LOG = '[SOS_WARDROBE_ITEMS]';

const shouldUseMock = (): boolean => API_CONFIG.isUsingFallbackBaseUrl;

type ApiRow = Record<string, unknown>;

const toStr = (v: unknown): string => (v == null ? '' : String(v));

const toBool = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1' || v === 'true') return true;
  return false;
};

const stringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof v === 'string' && v.trim()) {
    return [v.trim()];
  }
  return [];
};

const mapRowToItem = (row: ApiRow): WardrobeItem => {
  const id = toStr(row.id ?? row._id);
  const imageRaw =
    (row.image_url as string | undefined) ??
    (row.thumbnail_url as string | undefined) ??
    (row.image as string | undefined);
  return {
    id,
    name: toStr(row.name).trim() || 'Item',
    description: row.description == null ? null : toStr(row.description),
    category: toStr(row.category).trim() || '—',
    subcategory: row.subcategory == null ? null : toStr(row.subcategory),
    color: row.color == null ? null : toStr(row.color),
    brand: row.brand == null ? null : toStr(row.brand),
    material: row.material == null ? null : toStr(row.material),
    size: row.size == null ? null : toStr(row.size),
    purchasePrice:
      row.purchase_price != null
        ? toStr(row.purchase_price)
        : row.purchasePrice != null
          ? toStr(row.purchasePrice)
          : null,
    folderId:
      row.folder_id != null
        ? toStr(row.folder_id)
        : row.folderId != null
          ? toStr(row.folderId)
          : null,
    seasons: stringArray(row.seasons ?? row.season),
    occasions: stringArray(row.occasions ?? row.occasion),
    productUrl: row.product_url == null ? null : toStr(row.product_url),
    isFavorite: toBool(row.is_favorite ?? row.isFavorite),
    imageUrl: resolveProfileMediaUrl(imageRaw) ?? (imageRaw && /^https?:/i.test(imageRaw) ? imageRaw : null),
    raw: row,
  };
};

const unwrapItemArray = (payload: unknown): ApiRow[] => {
  if (Array.isArray(payload)) {
    return payload as ApiRow[];
  }
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) {
      return o.data as ApiRow[];
    }
    const inner = o.data;
    if (inner && typeof inner === 'object') {
      const d = inner as Record<string, unknown>;
      if (Array.isArray(d.items)) {
        return d.items as ApiRow[];
      }
      if (Array.isArray(d.data)) {
        return d.data as ApiRow[];
      }
    }
  }
  return [];
};

const unwrapSingleItem = (payload: unknown): WardrobeItem | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const o = payload as Record<string, unknown>;
  let node: ApiRow | null = null;
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    const d = o.data as Record<string, unknown>;
    if (d.item && typeof d.item === 'object') {
      node = d.item as ApiRow;
    } else if (d.id != null || d.name) {
      node = d as ApiRow;
    }
  } else if (o.id != null || o.name) {
    node = o as ApiRow;
  }
  return node ? mapRowToItem(node) : null;
};

const filtersToQuery = (filters: WardrobeItemListFilters): QueryParams => {
  const q: QueryParams = {};
  if (filters.search?.trim()) q.search = filters.search.trim();
  if (filters.folder_id) q.folder_id = filters.folder_id;
  if (filters.category?.trim()) q.category = filters.category.trim();
  if (filters.season?.trim()) q.season = filters.season.trim();
  if (filters.occasion?.trim()) q.occasion = filters.occasion.trim();
  if (filters.color?.trim()) q.color = filters.color.trim();
  if (filters.brand?.trim()) q.brand = filters.brand.trim();
  if (filters.is_favorite !== undefined) {
    q.is_favorite = filters.is_favorite ? 'true' : 'false';
  }
  return q;
};

/** Maps a full `WardrobeItem` into the lighter grid row type used by folder detail. */
export function wardrobeItemToFolderGridRow(it: WardrobeItem): WardrobeFolderItem {
  return {
    id: it.id,
    name: it.name,
    imageUri: it.imageUrl,
    category: it.category,
    color: it.color ?? undefined,
    seasons: it.seasons,
    occasions: it.occasions,
    size: it.size ?? null,
    material: it.material ?? null,
    description: it.description ?? null,
    raw: it.raw,
  };
}

export type CreateWardrobeItemInput = {
  name: string;
  category: string;
  brand: string;
  purchase_price: string;
  folder_id: string;
  seasons: string[];
  occasions: string[];
  imageUri: string;
};

export type UpdateWardrobeItemInput = {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  color?: string;
  brand?: string;
  material?: string;
  size?: string;
  purchase_price?: string;
  folder_id?: string;
  seasons?: string[];
  occasions?: string[];
  product_url?: string;
  is_favorite?: boolean;
  /** When set, appended as multipart file (replaces image). */
  imageUri?: string | null;
};

const appendIfDefined = (form: FormData, key: string, value: string | undefined) => {
  if (value !== undefined) {
    form.append(key, value);
  }
};

const buildUpdateFormData = (input: UpdateWardrobeItemInput): FormData => {
  const form = new FormData();
  appendIfDefined(form, 'name', input.name);
  appendIfDefined(form, 'description', input.description);
  appendIfDefined(form, 'category', input.category);
  appendIfDefined(form, 'subcategory', input.subcategory);
  appendIfDefined(form, 'color', input.color);
  appendIfDefined(form, 'brand', input.brand);
  appendIfDefined(form, 'material', input.material);
  appendIfDefined(form, 'size', input.size);
  appendIfDefined(form, 'purchase_price', input.purchase_price);
  appendIfDefined(form, 'folder_id', input.folder_id);
  appendIfDefined(form, 'product_url', input.product_url);
  if (input.is_favorite !== undefined) {
    form.append('is_favorite', input.is_favorite ? '1' : '0');
  }
  (input.seasons ?? []).forEach((s) => {
    if (s.trim()) form.append('seasons[]', s.trim().toLowerCase());
  });
  (input.occasions ?? []).forEach((o) => {
    if (o.trim()) form.append('occasions[]', o.trim().toLowerCase());
  });
  return form;
};

export const wardrobeItemService = {
  async listItems(filters: WardrobeItemListFilters = {}): Promise<WardrobeItem[]> {
    if (shouldUseMock()) {
      console.log(`${LOG} listItems skipped (mock mode)`);
      return [];
    }

    const query = filtersToQuery(filters);
    const url = buildApiUrl(API_ENDPOINTS.wardrobe.items);
    console.log(`${LOG} GET items`, { url, queryKeys: Object.keys(query) });

    try {
      const response = await apiClient.get<unknown>(API_ENDPOINTS.wardrobe.items, { query });
      const rows = unwrapItemArray(response);
      const mapped = rows.map(mapRowToItem);
      console.log(`${LOG} GET items OK`, { count: mapped.length });
      return mapped;
    } catch (error) {
      logSosError(LOG, 'GET items failed', error);
      throw error;
    }
  },

  async searchItems(queryText: string, perPage?: number): Promise<WardrobeItem[]> {
    if (shouldUseMock()) {
      console.log(`${LOG} searchItems skipped (mock mode)`);
      return [];
    }
    const query: QueryParams = { query: queryText.trim() };
    if (perPage != null) {
      query.per_page = perPage;
    }
    const url = buildApiUrl(API_ENDPOINTS.wardrobe.itemSearch);
    console.log(`${LOG} GET search`, { url, query });

    try {
      const response = await apiClient.get<unknown>(API_ENDPOINTS.wardrobe.itemSearch, { query });
      const rows = unwrapItemArray(response);
      const mapped = rows.map(mapRowToItem);
      console.log(`${LOG} GET search OK`, { count: mapped.length });
      return mapped;
    } catch (error) {
      logSosError(LOG, 'GET search failed', error);
      throw error;
    }
  },

  async getItem(itemId: string): Promise<WardrobeItem | null> {
    if (shouldUseMock()) {
      console.log(`${LOG} getItem mock`, { itemId });
      return mapRowToItem({
        id: itemId,
        name: 'Sample item',
        category: 'top',
        brand: '—',
        folder_id: '1',
        seasons: ['winter'],
        occasions: ['work'],
      });
    }
    const path = `${API_ENDPOINTS.wardrobe.items}/${encodeURIComponent(itemId)}`;
    console.log(`${LOG} GET item`, { path: buildApiUrl(path) });

    try {
      const response = await apiClient.get<unknown>(path);
      const item = unwrapSingleItem(response);
      console.log(`${LOG} GET item OK`, { id: item?.id });
      return item;
    } catch (error) {
      logSosError(LOG, 'GET item failed', error);
      throw error;
    }
  },

  async createItem(input: CreateWardrobeItemInput): Promise<WardrobeItem> {
    if (shouldUseMock()) {
      console.log(`${LOG} createItem mock`, { name: input.name, folder_id: input.folder_id });
      return mapRowToItem({
        id: 'mock',
        name: input.name,
        category: input.category,
        brand: input.brand,
        folder_id: input.folder_id,
      });
    }

    let prepared: { uri: string; filename: string; mimeType: string };
    try {
      prepared = await prepareProfileImageForUpload(input.imageUri);
    } catch (e) {
      logSosError(LOG, 'prepare image (create item)', e);
      throw toApiError(e, 'Could not process the photo. Try another image.');
    }

    const form = new FormData();
    form.append('name', input.name.trim());
    form.append('category', input.category.trim().toLowerCase());
    form.append('brand', input.brand.trim());
    form.append('purchase_price', String(input.purchase_price).trim());
    form.append('folder_id', String(input.folder_id).trim());
    input.seasons.forEach((s) => {
      if (s.trim()) form.append('seasons[]', s.trim().toLowerCase());
    });
    input.occasions.forEach((o) => {
      if (o.trim()) form.append('occasions[]', o.trim().toLowerCase());
    });
    form.append(
      'image',
      {
        uri: prepared.uri,
        name: prepared.filename,
        type: prepared.mimeType,
      } as unknown as Blob
    );

    console.log(`${LOG} POST items (multipart)`);

    try {
      const response = await apiClient.post<unknown>(API_ENDPOINTS.wardrobe.items, form);
      const created = unwrapSingleItem(response);
      if (created) {
        console.log(`${LOG} POST items OK`, { id: created.id, name: created.name });
        return created;
      }
      throw toApiError(new Error('missing item in create response'), 'Item may have been created. Refresh the list.');
    } catch (error) {
      logSosError(LOG, 'POST items failed', error);
      throw error;
    }
  },

  async updateItem(itemId: string, input: UpdateWardrobeItemInput): Promise<WardrobeItem> {
    if (shouldUseMock()) {
      console.log(`${LOG} updateItem mock`, { itemId });
      return mapRowToItem({
        id: itemId,
        name: input.name ?? 'Item',
        category: input.category ?? 'top',
        brand: input.brand ?? '—',
        folder_id: input.folder_id ?? '1',
        seasons: input.seasons ?? [],
        occasions: input.occasions ?? [],
      });
    }

    const path = `${API_ENDPOINTS.wardrobe.items}/${encodeURIComponent(itemId)}`;
    const form = buildUpdateFormData(input);

    if (input.imageUri) {
      let prepared: { uri: string; filename: string; mimeType: string };
      try {
        prepared = await prepareProfileImageForUpload(input.imageUri);
      } catch (e) {
        logSosError(LOG, 'prepare image (update item)', e);
        throw toApiError(e, 'Could not process the photo. Try another image.');
      }
      form.append(
        'image',
        {
          uri: prepared.uri,
          name: prepared.filename,
          type: prepared.mimeType,
        } as unknown as Blob
      );
    }

    console.log(`${LOG} PUT item (multipart)`, { path: buildApiUrl(path) });

    try {
      const response = await apiClient.put<unknown>(path, form);
      const updated = unwrapSingleItem(response);
      if (updated) {
        console.log(`${LOG} PUT item OK`, { id: updated.id, name: updated.name });
        return updated;
      }
      const refetched = await wardrobeItemService.getItem(itemId);
      if (refetched) {
        console.log(`${LOG} PUT item OK (refetched)`, { id: refetched.id });
        return refetched;
      }
      throw toApiError(new Error('missing item in update response'), 'Could not read updated item.');
    } catch (error) {
      logSosError(LOG, 'PUT item failed', error);
      throw error;
    }
  },

  async updateItemImage(itemId: string, imageUri: string): Promise<WardrobeItem | null> {
    if (shouldUseMock()) {
      console.log(`${LOG} updateItemImage mock`, { itemId });
      return mapRowToItem({
        id: itemId,
        name: 'Sample item',
        category: 'top',
        brand: '—',
        folder_id: '1',
        seasons: ['winter'],
        occasions: ['work'],
      });
    }
    let prepared: { uri: string; filename: string; mimeType: string };
    try {
      prepared = await prepareProfileImageForUpload(imageUri);
    } catch (e) {
      logSosError(LOG, 'prepare image (update item image)', e);
      throw toApiError(e, 'Could not process the photo. Try another image.');
    }

    const path = `${API_ENDPOINTS.wardrobe.items}/${encodeURIComponent(itemId)}/image`;
    const form = new FormData();
    form.append(
      'image',
      {
        uri: prepared.uri,
        name: prepared.filename,
        type: prepared.mimeType,
      } as unknown as Blob
    );

    console.log(`${LOG} POST item image`, { path: buildApiUrl(path) });

    try {
      const response = await apiClient.post<unknown>(path, form);
      const item = unwrapSingleItem(response);
      if (item) {
        console.log(`${LOG} POST item image OK`, { id: item.id });
        return item;
      }
      const refetched = await wardrobeItemService.getItem(itemId);
      if (refetched) {
        console.log(`${LOG} POST item image OK (refetched)`, { id: refetched.id });
      }
      return refetched;
    } catch (error) {
      logSosError(LOG, 'POST item image failed', error);
      throw error;
    }
  },

  async deleteItem(itemId: string): Promise<void> {
    if (shouldUseMock()) {
      console.log(`${LOG} deleteItem mock`, { itemId });
      return;
    }
    const path = `${API_ENDPOINTS.wardrobe.items}/${encodeURIComponent(itemId)}`;
    console.log(`${LOG} DELETE item`, { path: buildApiUrl(path) });

    try {
      await apiClient.delete(path);
      console.log(`${LOG} DELETE item OK`, { itemId });
    } catch (error) {
      logSosError(LOG, 'DELETE item failed', error);
      throw error;
    }
  },
};
