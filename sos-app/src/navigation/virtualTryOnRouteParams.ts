import type { ItemDetailsViewParams } from './wardrobeNavParams';
import type { Outfit } from '../models/Outfit.model';

export type VirtualTryOnRouteParams = {
  outfit?: Outfit;
  selectedItem?: ItemDetailsViewParams;
  /** Resume polling an existing job (server numeric id). */
  existingTryOnId?: string;
};
