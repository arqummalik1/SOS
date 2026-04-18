/**
 * Wardrobe folder (Style closet cards) — maps from GET/POST/PUT `/wardrobe/folders` payloads.
 */
export type WardrobeFolder = {
  id: string;
  name: string;
  description: string;
  colorCode: string;
  order: number;
  itemCount: number;
  /** Resolved display URL for folder cover image, if any. */
  featureImageUrl: string | null;
  featureImageAiStatus: string | null;
};

export type WardrobeFolderItem = {
  id: string;
  name: string;
  /** Use with `<Image source={{ uri }} />` when set. */
  imageUri: string | null;
  category?: string;
  color?: string;
  seasons?: string[];
  occasions?: string[];
  size?: string | null;
  material?: string | null;
  description?: string | null;
  raw?: Record<string, unknown>;
};
