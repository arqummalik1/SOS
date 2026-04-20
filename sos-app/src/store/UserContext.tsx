import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ProfileSetupData } from '../models/User.model';
import { ApiError } from '../api/errors';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

type UserContextType = {
  user: User | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfileSetup: (data: ProfileSetupData) => Promise<void>;
  clearUserData: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  id: '1',
  phone: '',
  name: '',
  email: null,
  profileImage: null,
  height: '',
  weight: '',
  dob: '',
  bodyShape: null,
  skinTone: null,
  fullBodyImageUrl: null,
  savedOutfits: [],
  stylePreferences: [],
  colorPreferences: [],
  budgetRange: '',
  wardrobeItems: [],
};

const parseStoredUser = (raw: string): User => {
  try {
    return { ...defaultUser, ...JSON.parse(raw) } as User;
  } catch {
    return { ...defaultUser };
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const loadUser = useCallback(async () => {
    try {
      if (!authState.isAuthenticated) {
        setUser(null);
        return;
      }

      const localUserData = await AsyncStorage.getItem('userData');
      let localMerge: User | null = null;
      if (localUserData) {
        localMerge = parseStoredUser(localUserData);
        setUser(localMerge);
      }

      if (!authState.isOnboarded) {
        return;
      }

      const remoteUser = await userService.getProfile(localMerge);
      if (remoteUser) {
        setUser(remoteUser);
        await AsyncStorage.setItem('userData', JSON.stringify(remoteUser));
      }
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'FORBIDDEN' || error.code === 'NOT_FOUND')) {
        console.warn('[SOS_API] User profile not available yet, keeping local user data.', {
          code: error.code,
        });
        return;
      }
      console.error('Error loading user:', error);
    }
  }, [authState.isAuthenticated, authState.isOnboarded]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const refreshProfile = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.isOnboarded) {
      return;
    }
    try {
      const localUserData = await AsyncStorage.getItem('userData');
      const localMerge = localUserData ? parseStoredUser(localUserData) : null;
      const remoteUser = await userService.getProfile(localMerge);
      if (remoteUser) {
        setUser(remoteUser);
        await AsyncStorage.setItem('userData', JSON.stringify(remoteUser));
      }
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'FORBIDDEN' || error.code === 'NOT_FOUND')) {
        console.warn('[SOS_API] refreshProfile skipped', { code: error.code });
        return;
      }
      console.error('Error refreshing profile:', error);
      throw error;
    }
  }, [authState.isAuthenticated, authState.isOnboarded]);

  const updateProfile = async (data: Partial<User>) => {
    const previous = user;
    const optimistic = { ...(user || defaultUser), ...data };
    setUser(optimistic);
    await AsyncStorage.setItem('userData', JSON.stringify(optimistic));
    try {
      const remote = await userService.updateProfile(data, user ?? undefined);
      setUser(remote);
      await AsyncStorage.setItem('userData', JSON.stringify(remote));
    } catch (error) {
      if (previous) {
        setUser(previous);
        await AsyncStorage.setItem('userData', JSON.stringify(previous));
      } else {
        setUser(null);
        await AsyncStorage.removeItem('userData');
      }
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const saveProfileSetup = async (data: ProfileSetupData) => {
    try {
      const dob = `${data.dob.year}-${data.dob.month}-${data.dob.day}`;
      const newUser: User = {
        ...defaultUser,
        name: data.name,
        height: data.height,
        weight: data.weight,
        dob,
        profileImage: data.profileImage,
        stylePreferences: data.stylePreferences,
        colorPreferences: data.colorPreferences,
        budgetRange: data.budgetRange,
        email: null,
        bodyShape: null,
        skinTone: null,
        fullBodyImageUrl: null,
      };

      setUser(newUser);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      await userService.saveProfileSetup(newUser);
    } catch (error) {
      console.error('Error saving profile setup:', error);
    }
  };

  const clearUserData = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, updateProfile, refreshProfile, saveProfileSetup, clearUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
