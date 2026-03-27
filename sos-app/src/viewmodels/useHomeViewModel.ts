import { useState, useCallback } from 'react';
import { useOutfits } from '../store/OutfitContext';
import { Outfit } from '../models/Outfit.model';

export const useHomeViewModel = () => {
  const { outfits, featuredOutfits, trendingOutfits, saveOutfit, unsaveOutfit, isSaved } = useOutfits();
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  const handleSave = useCallback(async (id: string) => {
    if (isSaved(id)) {
      await unsaveOutfit(id);
    } else {
      await saveOutfit(id);
    }
  }, [isSaved, saveOutfit, unsaveOutfit]);

  const handleSelect = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedOutfit(null);
  }, []);

  return {
    outfits,
    featured: featuredOutfits,
    trending: trendingOutfits,
    savedIds: outfits.filter(o => isSaved(o.id)).map(o => o.id),
    selectedOutfit,
    handleSave,
    handleSelect,
    closeDetail,
    isSaved,
  };
};
