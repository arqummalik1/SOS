import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ProfileSetupData } from '../models/User.model';

type UserContextType = {
  user: User | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
  saveProfileSetup: (data: ProfileSetupData) => Promise<void>;
  clearUserData: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  id: '1',
  phone: '',
  name: '',
  profileImage: null,
  height: '',
  weight: '',
  dob: '',
  savedOutfits: [],
  stylePreferences: [],
  colorPreferences: [],
  budgetRange: '',
  wardrobeItems: [],
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = { ...(user || defaultUser), ...data };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const saveProfileSetup = async (data: ProfileSetupData) => {
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
    };
    setUser(newUser);
    await AsyncStorage.setItem('userData', JSON.stringify(newUser));
  };

  const clearUserData = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, updateProfile, saveProfileSetup, clearUserData }}>
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
