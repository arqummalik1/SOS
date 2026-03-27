import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  phone: string | null;
};

type AuthContextType = {
  state: AuthState;
  login: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isOnboarded: false,
    phone: null,
  });

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const isOnboarded = await AsyncStorage.getItem('isOnboarded');
      const phone = await AsyncStorage.getItem('userPhone');
      setState({
        isAuthenticated: !!phone,
        isOnboarded: isOnboarded === 'true',
        phone,
      });
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  };

  const login = async (phone: string) => {
    await AsyncStorage.setItem('userPhone', phone);
    setState((prev) => ({ ...prev, phone }));
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    // Mock OTP verification - any 6-digit code works
    if (otp.length === 6) {
      setState((prev) => ({ ...prev, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('isOnboarded', 'true');
    setState((prev) => ({ ...prev, isOnboarded: true }));
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userPhone');
    await AsyncStorage.removeItem('isOnboarded');
    await AsyncStorage.removeItem('userData');
    setState({
      isAuthenticated: false,
      isOnboarded: false,
      phone: null,
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, verifyOTP, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
