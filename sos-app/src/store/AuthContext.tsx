import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/tokenManager';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

type AuthState = {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  phone: string | null;
};

type AuthContextType = {
  state: AuthState;
  login: (phone: string) => Promise<string>;
  resendOTP: () => Promise<string>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_SESSION_KEY = 'authSession';

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
      const phone = await AsyncStorage.getItem('userPhone');
      const localOnboarded = await AsyncStorage.getItem('isOnboarded');

      let isOnboarded = localOnboarded === 'true';
      if (phone) {
        try {
          const status = await authService.getOnboardingStatus();
          isOnboarded = status.isOnboardingComplete;
          await AsyncStorage.setItem('isOnboarded', isOnboarded ? 'true' : 'false');
        } catch (error) {
          console.warn('Failed to refresh onboarding status, using local value:', error);
        }
      }

      setState({
        isAuthenticated: !!phone,
        isOnboarded,
        phone,
      });
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  };

  const login = async (phone: string): Promise<string> => {
    const result = await authService.requestOtp({ phone });
    await AsyncStorage.setItem('userPhone', phone);
    setState((prev) => ({ ...prev, phone }));
    return result.message ?? 'OTP sent successfully';
  };

  const verifyOTP = async (otp: string): Promise<{ success: boolean; message: string }> => {
    if (!state.phone) {
      return {
        success: false,
        message: 'Missing phone number. Please login again.',
      };
    }
    const phone = state.phone;

    const deriveFallbackName = async (): Promise<string> => {
      try {
        const storedUserRaw = await AsyncStorage.getItem('userData');
        if (storedUserRaw) {
          const parsed = JSON.parse(storedUserRaw) as { name?: string | null };
          if (parsed?.name && parsed.name.trim().length > 0) {
            return parsed.name.trim();
          }
        }
      } catch (error) {
        console.warn('Unable to derive stored user name, using fallback:', error);
      }

      const phoneSuffix = phone.slice(-4);
      return `SOS User ${phoneSuffix}`;
    };

    const session = await authService.verifyOtp({
      phone,
      otp,
      // Backend requires name when user is not registered yet.
      name: await deriveFallbackName(),
    });

    if (session.success) {
      let isOnboarded = Boolean(session.isOnboardingComplete);
      try {
        const status = await authService.getOnboardingStatus();
        isOnboarded = status.isOnboardingComplete;
      } catch (error) {
        console.warn('Failed to refresh onboarding status after login, using session value:', error);
      }
      await AsyncStorage.setItem('isOnboarded', isOnboarded ? 'true' : 'false');

      if (session.user) {
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({
            id: session.user.id,
            phone: session.user.phone,
            name: session.user.name,
            email: session.user.email ?? null,
            profileImage: null,
            height: session.user.height,
            weight: session.user.weight,
            dob: session.user.dob,
            bodyShape: null,
            skinTone: null,
            fullBodyImageUrl: null,
            savedOutfits: [],
            stylePreferences: session.user.stylePreferences,
            colorPreferences: session.user.colorPreferences,
            budgetRange: '',
            wardrobeItems: [],
          })
        );
      }

      await AsyncStorage.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify({
          userId: session.userId ?? null,
          roles: session.roles ?? [],
          permissions: session.permissions ?? [],
          activeSessions: session.activeSessions ?? null,
        })
      );

      setState((prev) => ({ ...prev, isAuthenticated: true, isOnboarded }));
      return {
        success: true,
        message: session.message ?? 'Logged in successfully',
      };
    }

    return {
      success: false,
      message: session.message ?? 'Invalid OTP. Please try again.',
    };
  };

  const resendOTP = async (): Promise<string> => {
    if (!state.phone) {
      throw new Error('Missing phone number. Please login again.');
    }
    const result = await authService.resendOtp({ phone: state.phone });
    return result.message ?? 'OTP resent successfully';
  };

  const completeOnboarding = async () => {
    await userService.markOnboardingComplete();
    try {
      const status = await authService.getOnboardingStatus();
      await AsyncStorage.setItem('isOnboarded', status.isOnboardingComplete ? 'true' : 'false');
      setState((prev) => ({ ...prev, isOnboarded: status.isOnboardingComplete }));
      return;
    } catch (error) {
      console.warn('Failed to refresh onboarding status after completion, using optimistic fallback:', error);
    }

    await AsyncStorage.setItem('isOnboarded', 'true');
    setState((prev) => ({ ...prev, isOnboarded: true }));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    await AsyncStorage.multiRemove([
      'userPhone',
      'isOnboarded',
      'userData',
      'savedOutfits',
      AUTH_SESSION_KEY,
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
    ]);
    setState({
      isAuthenticated: false,
      isOnboarded: false,
      phone: null,
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, resendOTP, verifyOTP, completeOnboarding, logout }}>
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
