import { useState, useCallback, useMemo } from 'react';
import { useOutfits } from '../store/OutfitContext';
import { Outfit } from '../models/Outfit.model';

export const useSearchViewModel = () => {
  const { outfits, filterByCategory } = useOutfits();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const results = useMemo(() => {
    let filtered = outfits;

    if (selectedCategory !== 'All') {
      filtered = filterByCategory(selectedCategory);
    }

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (outfit) =>
          outfit.title.toLowerCase().includes(lowerQuery) ||
          outfit.category.toLowerCase().includes(lowerQuery) ||
          outfit.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [outfits, query, selectedCategory, filterByCategory]);

  const clearQuery = useCallback(() => {
    setQuery('');
  }, []);

  const selectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return {
    query,
    results,
    selectedCategory,
    setQuery,
    clearQuery,
    selectCategory,
  };
};
