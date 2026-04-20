import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, tokenManager } from '../api/tokenManager';
import { authService, OnboardingStatus } from '../services/authService';
import { userService } from '../services/userService';
import { resolveNextOnboardingRoute } from '../navigation/onboardingFlow';

type OnboardingEntryRoute =
  | 'First'
  | 'SignIn'
  | 'OTP'
  | 'ProfileSetupHub'
  | 'ProfileSetup'
  | 'FullBodyPhoto'
  | 'BodyMeasurements'
  | 'StylePreferences';

type AuthState = {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  phone: string | null;
  onboardingEntryRoute: OnboardingEntryRoute;
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
const ONBOARDING_LOG = '[SOS_ONBOARDING_FLOW]';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isOnboarded: false,
    phone: null,
    onboardingEntryRoute: 'First',
  });

  const resolveEntryRouteFromStatus = (
    status: OnboardingStatus,
    fallback: OnboardingEntryRoute = 'ProfileSetupHub'
  ): OnboardingEntryRoute => {
    const nextRoute = resolveNextOnboardingRoute(status);
    if (nextRoute === 'Main') {
      return fallback;
    }
    return nextRoute;
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const phone = await AsyncStorage.getItem('userPhone');
      const localOnboarded = await AsyncStorage.getItem('isOnboarded');
      const accessToken = await tokenManager.getAccessToken();

      let isOnboarded = localOnboarded === 'true';
      let onboardingEntryRoute: OnboardingEntryRoute = 'First';
      
      // Only consider user authenticated if they have a valid access token
      const isAuthenticated = !!accessToken && !!phone;

      if (isAuthenticated) {
        try {
          const status = await authService.getOnboardingStatus();
          isOnboarded = status.isOnboardingComplete;
          if (!isOnboarded) {
            onboardingEntryRoute = resolveEntryRouteFromStatus(status);
          }
          await AsyncStorage.setItem('isOnboarded', isOnboarded ? 'true' : 'false');
          console.log('[SOS_AUTH] Session restored - user is authenticated and onboarding status:', isOnboarded);
        } catch (error) {
          console.warn('[SOS_AUTH] Failed to refresh onboarding status, using local value:', error);
          console.log('[SOS_AUTH] Session restored from local storage - onboarding:', isOnboarded);
          onboardingEntryRoute = isOnboarded ? 'First' : 'ProfileSetupHub';
        }
      } else if (phone) {
        console.log('[SOS_AUTH] Phone exists but no valid token - user needs to login again');
        onboardingEntryRoute = 'SignIn';
      } else {
        console.log('[SOS_AUTH] No session found - showing login screen');
      }

      setState({
        isAuthenticated,
        isOnboarded,
        phone,
        onboardingEntryRoute,
      });
    } catch (error) {
      console.error('[SOS_AUTH] Error loading auth state:', error);
      setState({
        isAuthenticated: false,
        isOnboarded: false,
        phone: null,
        onboardingEntryRoute: 'First',
      });
    }
  };

  const login = async (phone: string): Promise<string> => {
    const result = await authService.requestOtp({ phone });
    await AsyncStorage.setItem('userPhone', phone);
    setState((prev) => ({ ...prev, phone, onboardingEntryRoute: 'OTP' }));
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
      let onboardingEntryRoute: OnboardingEntryRoute = 'ProfileSetupHub';
      try {
        const status = await authService.getOnboardingStatus();
        isOnboarded = status.isOnboardingComplete;
        if (!isOnboarded) {
          onboardingEntryRoute = resolveEntryRouteFromStatus(status);
        }
      } catch (error) {
        console.warn('Failed to refresh onboarding status after login, using session value:', error);
        onboardingEntryRoute = isOnboarded ? 'First' : 'ProfileSetupHub';
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

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isOnboarded,
        onboardingEntryRoute,
      }));
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
    console.log(`${ONBOARDING_LOG} completeOnboarding started`);
    await userService.markOnboardingComplete();
    console.log(`${ONBOARDING_LOG} onboarding/complete API succeeded`);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const attempts = 3;
    try {
      let finalStatus: OnboardingStatus | null = null;
      for (let i = 0; i < attempts; i += 1) {
        const status = await authService.getOnboardingStatus();
        console.log(`${ONBOARDING_LOG} onboarding/status attempt`, {
          attempt: i + 1,
          isOnboardingComplete: status.isOnboardingComplete,
          steps: status.steps,
        });
        finalStatus = status;
        if (status.isOnboardingComplete) {
          break;
        }
        if (i < attempts - 1) {
          await wait(450);
        }
      }

      const isComplete = finalStatus?.isOnboardingComplete ?? false;
      await AsyncStorage.setItem('isOnboarded', isComplete ? 'true' : 'false');
      setState((prev) => ({
        ...prev,
        isOnboarded: isComplete,
        onboardingEntryRoute: isComplete
          ? 'First'
          : resolveEntryRouteFromStatus(finalStatus ?? { isOnboardingComplete: false, steps: {} }),
      }));
      console.log(`${ONBOARDING_LOG} completeOnboarding state updated from status`, {
        isOnboarded: isComplete,
      });
      if (!isComplete) {
        throw new Error('Onboarding completion is not confirmed yet. Please try again.');
      }
      return;
    } catch (error) {
      console.warn(`${ONBOARDING_LOG} status refresh failed`, error);
      await AsyncStorage.setItem('isOnboarded', 'false');
      setState((prev) => ({ ...prev, isOnboarded: false }));
      throw error instanceof Error
        ? error
        : new Error('Could not confirm onboarding completion. Please try again.');
    }
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
      onboardingEntryRoute: 'First',
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
