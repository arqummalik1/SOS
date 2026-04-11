import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Outfit } from '../models/Outfit.model';
import { mockOutfits } from '../data/outfits.mock';

type OutfitContextType = {
  outfits: Outfit[];
  savedOutfits: string[];
  featuredOutfits: Outfit[];
  trendingOutfits: Outfit[];
  saveOutfit: (id: string) => Promise<void>;
  unsaveOutfit: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  searchOutfits: (query: string) => Outfit[];
  filterByCategory: (category: string) => Outfit[];
  clearSavedOutfits: () => void;
};

const OutfitContext = createContext<OutfitContextType | undefined>(undefined);

export const OutfitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [outfits] = useState<Outfit[]>(mockOutfits);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);

  useEffect(() => {
    loadSavedOutfits();
  }, []);

  const loadSavedOutfits = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedOutfits');
      if (saved) {
        setSavedOutfits(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved outfits:', error);
    }
  };

  const saveOutfit = async (id: string) => {
    try {
      const newSaved = [...savedOutfits, id];
      setSavedOutfits(newSaved);
      await AsyncStorage.setItem('savedOutfits', JSON.stringify(newSaved));
    } catch (error) {
      console.error('Error saving outfit:', error);
    }
  };

  const unsaveOutfit = async (id: string) => {
    try {
      const newSaved = savedOutfits.filter((savedId) => savedId !== id);
      setSavedOutfits(newSaved);
      await AsyncStorage.setItem('savedOutfits', JSON.stringify(newSaved));
    } catch (error) {
      console.error('Error unsaving outfit:', error);
    }
  };

  const isSaved = (id: string) => savedOutfits.includes(id);

  const searchOutfits = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return outfits.filter(
      (outfit) =>
        outfit.title.toLowerCase().includes(lowerQuery) ||
        outfit.category.toLowerCase().includes(lowerQuery) ||
        outfit.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const filterByCategory = (category: string) => {
    if (category === 'All') return outfits;
    return outfits.filter((outfit) => outfit.category === category);
  };

  const clearSavedOutfits = () => {
    setSavedOutfits([]);
  };

  const featuredOutfits = outfits.filter((o) => o.isFeatured);
  const trendingOutfits = outfits.filter((o) => o.isTrending);

  return (
    <OutfitContext.Provider
      value={{
        outfits,
        savedOutfits,
        featuredOutfits,
        trendingOutfits,
        saveOutfit,
        unsaveOutfit,
        isSaved,
        searchOutfits,
        filterByCategory,
        clearSavedOutfits,
      }}
    >
      {children}
    </OutfitContext.Provider>
  );
};

export const useOutfits = () => {
  const context = useContext(OutfitContext);
  if (!context) {
    throw new Error('useOutfits must be used within OutfitProvider');
  }
  return context;
};
