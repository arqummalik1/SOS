/**
 * Shared route payloads for Wardrobe stack + Home stack screens that edit or view items.
 */

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
