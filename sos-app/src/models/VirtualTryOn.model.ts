/**
 * Virtual try-on job as returned by `GET/POST /virtual-tryon` (see docs/completeAPIDocumentation.html).
 * Field names follow API JSON; optional fields may be absent on list rows.
 */
export type VirtualTryOnStatus = 'pending' | 'processing' | 'completed' | 'failed' | string;

export interface VirtualTryOn {
  id: string;
  outfitId: string | null;
  wardrobeItemId: string | null;
  category: string;
  mode: string;
  status: VirtualTryOnStatus;
  modelImageUrl: string | null;
  garmentImageUrl: string | null;
  resultImageUrl: string | null;
  processedResultImageUrl: string | null;
  reaction: 'liked' | 'disliked' | null;
  rating: number | null;
  isSavedToLookbook: boolean;
  savedToLookbookAt: string | null;
  scheduledFor: string | null;
  regeneratedFromId: string | null;
  regeneratedAsId: string | null;
  isRegenerated: boolean;
  processingStartedAt: string | null;
  processingCompletedAt: string | null;
  createdAt: string | null;
  retryCount?: number;
  raw?: Record<string, unknown>;
}
