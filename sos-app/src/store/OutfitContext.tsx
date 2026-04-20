import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Outfit } from '../models/Outfit.model';
import { mockOutfits } from '../data/outfits.mock';
import { wardrobeService } from '../services/wardrobeService';
import { useAuth } from './AuthContext';

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
  const { state: authState } = useAuth();
  const [outfits, setOutfits] = useState<Outfit[]>(mockOutfits);
  const [savedOutfits, setSavedOutfits] = useState<string[]>([]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setOutfits(mockOutfits);
      setSavedOutfits([]);
      return;
    }
    if (!authState.isOnboarded) {
      return;
    }
    void loadOutfits();
    void loadSavedOutfits();
  }, [authState.isAuthenticated, authState.isOnboarded]);

  const loadOutfits = async () => {
    try {
      const remoteOutfits = await wardrobeService.getOutfits();
      if (remoteOutfits.length > 0) {
        setOutfits(remoteOutfits);
      }
    } catch (error) {
      console.error('Error loading outfits:', error);
    }
  };

  const loadSavedOutfits = async () => {
    try {
      const remoteSaved = await wardrobeService.getSavedOutfitIds();
      if (remoteSaved.length > 0) {
        setSavedOutfits(remoteSaved);
        await AsyncStorage.setItem('savedOutfits', JSON.stringify(remoteSaved));
        return;
      }

      const localSaved = await AsyncStorage.getItem('savedOutfits');
      if (localSaved) {
        setSavedOutfits(JSON.parse(localSaved));
      }
    } catch (error) {
      console.error('Error loading saved outfits:', error);
    }
  };

  const saveOutfit = async (id: string) => {
    try {
      const newSaved = Array.from(new Set([...savedOutfits, id]));
      setSavedOutfits(newSaved);
      await AsyncStorage.setItem('savedOutfits', JSON.stringify(newSaved));
      await wardrobeService.saveOutfit(id);
    } catch (error) {
      console.error('Error saving outfit:', error);
    }
  };

  const unsaveOutfit = async (id: string) => {
    try {
      const newSaved = savedOutfits.filter((savedId) => savedId !== id);
      setSavedOutfits(newSaved);
      await AsyncStorage.setItem('savedOutfits', JSON.stringify(newSaved));
      await wardrobeService.unsaveOutfit(id);
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
