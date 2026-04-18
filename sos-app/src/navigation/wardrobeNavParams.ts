/**
 * Shared route payloads for Wardrobe stack + Home stack screens that edit or view items.
 */

import type { WardrobeFolder } from '../models/WardrobeFolder.model';

export type EditItemDetailsParams =
  | { mode: 'create'; imageUri: string; folderId?: string }
  | { mode: 'edit'; itemId: string };

export type ItemDetailsViewParams = {
  name: string;
  wardrobeItemId?: string;
  image: { uri: string } | number;
  details: {
    category: string;
    color: string;
    season: string;
    size: string;
    material: string;
    occasion: string;
    description: string;
  };
};

/** Wardrobe stack: open My Items for a folder / collection. */
export type WardrobeMyItemsRouteParams = {
  folderId: string;
  folderName?: string;
  folder?: WardrobeFolder;
};
