/**
 * Wardrobe clothing item — aligns with `/wardrobe/items` API (create/list/update).
 */
export type WardrobeItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  color: string | null;
  brand: string | null;
  material: string | null;
  size: string | null;
  purchasePrice: string | null;
  folderId: string | null;
  seasons: string[];
  occasions: string[];
  productUrl: string | null;
  isFavorite: boolean;
  imageUrl: string | null;
  raw?: Record<string, unknown>;
};

export type WardrobeItemListFilters = {
  search?: string;
  folder_id?: string;
  category?: string;
  season?: string;
  occasion?: string;
  is_favorite?: boolean;
  color?: string;
  brand?: string;
};
