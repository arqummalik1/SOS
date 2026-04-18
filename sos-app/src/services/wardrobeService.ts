import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/errors';
import { Outfit } from '../models/Outfit.model';

type ApiOutfit = Partial<Outfit> & { _id?: string };

const shouldUseMock = (): boolean => API_CONFIG.isUsingFallbackBaseUrl;

const toOutfit = (input: ApiOutfit): Outfit => ({
  id: input.id ?? input._id ?? '',
  imageUrl: input.imageUrl ?? '',
  title: input.title ?? '',
  category: input.category ?? 'All',
  tags: input.tags ?? [],
  isTrending: input.isTrending ?? false,
  isFeatured: input.isFeatured ?? false,
  color: input.color ?? '',
  style: input.style ?? '',
  occasion: input.occasion ?? '',
  priceRange: input.priceRange ?? '',
});

const unwrapItems = <T>(input: unknown): T[] => {
  if (Array.isArray(input)) {
    return input as T[];
  }

  if (input && typeof input === 'object') {
    const source = input as Record<string, unknown>;
    if (Array.isArray(source.data)) {
      return source.data as T[];
    }
    if (Array.isArray(source.items)) {
      return source.items as T[];
    }
  }

  return [];
};

const isWardrobeUnavailable = (error: unknown): boolean =>
  error instanceof ApiError && (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN');

export const wardrobeService = {
  async getOutfits(): Promise<Outfit[]> {
    if (shouldUseMock()) {
      return [];
    }

    try {
      const response = await apiClient.get<unknown>(API_ENDPOINTS.wardrobe.outfits);
      return unwrapItems<ApiOutfit>(response).map(toOutfit);
    } catch (error) {
      if (isWardrobeUnavailable(error)) {
        console.warn('[SOS_API] Wardrobe outfits unavailable, using mock/local data.', {
          code: error instanceof ApiError ? error.code : undefined,
        });
        return [];
      }
      throw error;
    }
  },

  async getSavedOutfitIds(): Promise<string[]> {
    if (shouldUseMock()) {
      return [];
    }

    try {
      const response = await apiClient.get<unknown>(API_ENDPOINTS.wardrobe.savedOutfits);
      const ids = unwrapItems<string>(response);
      return ids.filter((id) => typeof id === 'string');
    } catch (error) {
      if (isWardrobeUnavailable(error)) {
        console.warn('[SOS_API] Saved outfits unavailable, using local storage only.', {
          code: error instanceof ApiError ? error.code : undefined,
        });
        return [];
      }
      throw error;
    }
  },

  async saveOutfit(outfitId: string): Promise<void> {
    if (shouldUseMock()) {
      return;
    }

    await apiClient.post(API_ENDPOINTS.wardrobe.savedOutfits, { outfitId });
  },

  async unsaveOutfit(outfitId: string): Promise<void> {
    if (shouldUseMock()) {
      return;
    }

    await apiClient.delete(`${API_ENDPOINTS.wardrobe.savedOutfits}/${outfitId}`);
  },
};
