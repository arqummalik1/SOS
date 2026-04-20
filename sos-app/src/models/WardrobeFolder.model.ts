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
  /** Resolved display URL for folder cover; mapping prefers `processed_feature_*` over raw feature image when present. */
  featureImageUrl: string | null;
  featureImageAiStatus: string | null;
};

export type WardrobeFolderItem = {
  id: string;
  name: string;
  /** Resolved garment image for folder-detail rows; prefers `processed_*` from the API. */
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
