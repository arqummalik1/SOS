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

/**
 * Canonical wardrobe `category` values expected by `POST|PUT /wardrobe/items` (Laravel `Rule::in`).
 * Maps common API/AI synonyms so the client never sends try-on tokens (`tops`, `bottoms`) here.
 */
export const normalizeWardrobeItemCategory = (raw: string): string => {
  const t = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    top: 'top',
    tops: 'top',
    shirt: 'top',
    shirts: 'top',
    tee: 'top',
    tshirt: 'top',
    blouse: 'top',
    upper: 'top',
    bottom: 'bottom',
    bottoms: 'bottom',
    pant: 'bottom',
    pants: 'bottom',
    jeans: 'bottom',
    skirt: 'bottom',
    shorts: 'bottom',
    outerwear: 'outerwear',
    coat: 'outerwear',
    jacket: 'outerwear',
    blazer: 'outerwear',
    dress: 'dress',
    dresses: 'dress',
    'one-piece': 'dress',
    onepiece: 'dress',
    jumpsuit: 'dress',
  };
  return map[t] ?? t;
};

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
  if (typeof v === 'number' && !Number.isNaN(v)) {
    return [String(v)].filter(Boolean);
  }
  if (typeof v === 'string' && v.trim()) {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const mapRowToItem = (row: ApiRow): WardrobeItem => {
  const id = toStr(row.id ?? row._id);
  /** Prefer server-processed assets for all wardrobe UI; fall back to original or legacy keys. */
  const imageRaw =
    (row.processed_image_url as string | undefined) ??
    (row.processedImageUrl as string | undefined) ??
    (row.processed_image as string | undefined) ??
    (row.processedImage as string | undefined) ??
    (row.original_image_url as string | undefined) ??
    (row.originalImageUrl as string | undefined) ??
    (row.original_image as string | undefined) ??
    (row.originalImage as string | undefined) ??
    (row.image_url as string | undefined) ??
    (row.thumbnail_url as string | undefined) ??
    (row.image as string | undefined);
  return {
    id,
    name: toStr(row.name).trim() || 'Item',
    description: row.description == null ? null : toStr(row.description),
    category: (() => {
      const c = toStr(row.category).trim();
      if (!c || c === '—') {
        return 'top';
      }
      return normalizeWardrobeItemCategory(c);
    })(),
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
    } else if (d.wardrobe_item && typeof d.wardrobe_item === 'object') {
      node = d.wardrobe_item as ApiRow;
    } else if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) {
      const inner = d.data as Record<string, unknown>;
      if (inner.id != null || inner.name) {
        node = inner as ApiRow;
      }
    } else if (d.id != null || d.name) {
      node = d as ApiRow;
    }
  } else if (o.wardrobe_item && typeof o.wardrobe_item === 'object') {
    node = o.wardrobe_item as ApiRow;
  } else if (o.item && typeof o.item === 'object' && !Array.isArray(o.item)) {
    node = o.item as ApiRow;
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
  /** Optional — included when API expects full item fields on create */
  description?: string;
  color?: string;
  material?: string;
  size?: string;
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
  if (input.description !== undefined) {
    form.append('description', input.description);
  }
  if (input.category !== undefined && input.category.trim() !== '') {
    form.append('category', normalizeWardrobeItemCategory(input.category));
  }
  form.append('subcategory', (input.subcategory ?? '').trim());
  appendIfDefined(form, 'color', input.color);
  appendIfDefined(form, 'brand', input.brand);
  appendIfDefined(form, 'material', input.material);
  appendIfDefined(form, 'size', input.size);
  appendIfDefined(form, 'purchase_price', input.purchase_price);
  if (input.folder_id !== undefined && input.folder_id !== null && String(input.folder_id).trim() !== '') {
    form.append('folder_id', String(input.folder_id).trim());
  }
  form.append('product_url', (input.product_url ?? '').trim());
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
    form.append('category', normalizeWardrobeItemCategory(input.category));
    form.append('brand', input.brand.trim());
    form.append('purchase_price', String(input.purchase_price).trim());
    form.append('folder_id', String(input.folder_id).trim());
    // Optional fields: only send when set so create matches minimal Hoppscotch bodies and avoids
    // backend rejecting unknown formats (e.g. hex color vs named color).
    const desc = input.description?.trim();
    if (desc) {
      form.append('description', desc);
    }
    if (input.color?.trim()) {
      form.append('color', input.color.trim());
    }
    if (input.material?.trim()) {
      form.append('material', input.material.trim().toLowerCase());
    }
    if (input.size?.trim()) {
      form.append('size', input.size.trim());
    }
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

    console.log(`${LOG} POST items (multipart)`, {
      endpoint: API_ENDPOINTS.wardrobe.items,
      body: {
        name: input.name.trim(),
        category: normalizeWardrobeItemCategory(input.category),
        brand: input.brand.trim(),
        purchase_price: String(input.purchase_price).trim(),
        folder_id: String(input.folder_id).trim(),
        seasons: input.seasons.map((s) => s.trim().toLowerCase()).filter(Boolean),
        occasions: input.occasions.map((o) => o.trim().toLowerCase()).filter(Boolean),
        description: input.description?.trim() || null,
        color: input.color?.trim() || null,
        material: input.material?.trim().toLowerCase() || null,
        size: input.size?.trim() || null,
        image: {
          filename: prepared.filename,
          mimeType: prepared.mimeType,
        },
      },
    });

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
