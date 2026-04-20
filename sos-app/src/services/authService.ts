import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/errors';
import { tokenManager } from '../api/tokenManager';

type RequestOtpPayload = {
  phone: string;
};

type VerifyOtpPayload = {
  phone: string;
  otp: string;
  name?: string;
};

type AuthResponseEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type RequestOtpResponseData = {
  phone?: string;
  expires_in?: number;
  is_new_user?: boolean;
};

type OnboardingStatusResponseData = {
  is_onboarding_complete?: boolean;
  steps?: Record<string, boolean>;
};

type VerifyOtpResponseData = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  token?: string;
  userId?: string;
  user?: {
    id?: number | string;
    name?: string | null;
    phone?: string;
    email?: string | null;
    height?: string | null;
    weight?: string | null;
    date_of_birth?: string | null;
    style_preferences?: string[] | null;
    skin_tone?: string[] | string | null;
    is_onboarding_complete?: boolean;
  };
  is_new_user?: boolean;
  active_sessions?: number;
  roles?: string[];
  permissions?: string[];
};

export type AuthSession = {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  message?: string;
  isNewUser?: boolean;
  isOnboardingComplete?: boolean;
  activeSessions?: number;
  roles?: string[];
  permissions?: string[];
  user?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    height: string;
    weight: string;
    dob: string;
    stylePreferences: string[];
    colorPreferences: string[];
  };
};

export type OnboardingStatus = {
  isOnboardingComplete: boolean;
  steps: Record<string, boolean>;
  message?: string;
};

const shouldUseMock = (): boolean => API_CONFIG.isUsingFallbackBaseUrl;

const getAccessToken = (payload: VerifyOtpResponseData): string | undefined =>
  payload.accessToken ?? payload.access_token ?? payload.token;

const getRefreshToken = (payload: VerifyOtpResponseData): string | undefined =>
  payload.refreshToken ?? payload.refresh_token;

const getUserId = (payload: VerifyOtpResponseData): string | undefined => {
  if (payload.userId) {
    return payload.userId;
  }

  const nestedUserId = payload.user?.id;
  if (nestedUserId === null || nestedUserId === undefined) {
    return undefined;
  }

  return String(nestedUserId);
};

const normalizeArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
};

const normalizeColorPreferences = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

export const authService = {
  async requestOtp(payload: RequestOtpPayload): Promise<{
    success: boolean;
    message?: string;
    expiresIn?: number;
    isNewUser?: boolean;
    phone?: string;
  }> {
    console.log('[SOS_AUTH] Requesting OTP for phone:', payload.phone);
    
    if (shouldUseMock()) {
      console.warn('[SOS_AUTH] Using mock mode - OTP not actually sent');
      return { success: true, message: 'OTP sent successfully' };
    }

    try {
      const response = await apiClient.post<AuthResponseEnvelope<RequestOtpResponseData>>(
        API_ENDPOINTS.auth.requestOtp,
        payload,
        { skipAuth: true }
      );

      console.log('[SOS_AUTH] OTP request successful:', {
        success: response.success,
        message: response.message,
        expiresIn: response.data?.expires_in,
        isNewUser: response.data?.is_new_user,
      });

      return {
        success: response.success ?? true,
        message: response.message ?? 'OTP sent successfully',
        expiresIn: response.data?.expires_in,
        isNewUser: response.data?.is_new_user,
        phone: response.data?.phone,
      };
    } catch (error) {
      console.error('[SOS_AUTH] OTP request failed:', error);
      const apiError = error as ApiError;
      throw new Error(
        apiError.message || 
        'Failed to send OTP. Please check your phone number and try again.'
      );
    }
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthSession> {
    if (shouldUseMock()) {
      const success = payload.otp.length === 6;
      return { success };
    }

    const response = await apiClient.post<AuthResponseEnvelope<VerifyOtpResponseData>>(
      API_ENDPOINTS.auth.verifyOtp,
      payload,
      { skipAuth: true }
    );

    const tokenSource = response.data ?? {};
    const accessToken = getAccessToken(tokenSource);
    const refreshToken = getRefreshToken(tokenSource);
    if (accessToken || refreshToken) {
      await tokenManager.setTokens({
        accessToken: accessToken ?? null,
        refreshToken: refreshToken ?? null,
      });
    }

    const userId = getUserId(tokenSource);
    const user = tokenSource.user
      ? {
          id: userId ?? '0',
          name: tokenSource.user.name?.trim() || '',
          phone: tokenSource.user.phone ?? payload.phone,
          email: tokenSource.user.email ?? null,
          height: tokenSource.user.height ?? '',
          weight: tokenSource.user.weight ?? '',
          dob: tokenSource.user.date_of_birth ?? '',
          stylePreferences: normalizeArray(tokenSource.user.style_preferences),
          colorPreferences: normalizeColorPreferences(tokenSource.user.skin_tone),
        }
      : undefined;

    return {
      success: response.success ?? Boolean(accessToken),
      accessToken,
      refreshToken,
      userId,
      message: response.message,
      isNewUser: tokenSource.is_new_user,
      activeSessions: tokenSource.active_sessions,
      isOnboardingComplete: Boolean(tokenSource.user?.is_onboarding_complete),
      roles: normalizeArray(tokenSource.roles),
      permissions: normalizeArray(tokenSource.permissions),
      user,
    };
  },

  async resendOtp(payload: RequestOtpPayload): Promise<{
    success: boolean;
    message?: string;
    expiresIn?: number;
    isNewUser?: boolean;
    phone?: string;
  }> {
    if (shouldUseMock()) {
      return { success: true, message: 'OTP resent successfully' };
    }

    try {
      const response = await apiClient.post<AuthResponseEnvelope<RequestOtpResponseData>>(
        API_ENDPOINTS.auth.resendOtp,
        payload,
        { skipAuth: true }
      );

      return {
        success: response.success ?? true,
        message: response.message ?? 'OTP resent successfully',
        expiresIn: response.data?.expires_in,
        isNewUser: response.data?.is_new_user,
        phone: response.data?.phone,
      };
    } catch (error) {
      const apiError = error as ApiError;
      // Some environments expose resend via /auth/send-otp only.
      if (apiError?.status === 404 || apiError?.status === 405) {
        return this.requestOtp(payload);
      }
      throw error;
    }
  },

  async getOnboardingStatus(): Promise<OnboardingStatus> {
    if (shouldUseMock()) {
      return {
        isOnboardingComplete: false,
        steps: {},
        message: 'Onboarding status retrieved',
      };
    }

    const response = await apiClient.get<AuthResponseEnvelope<OnboardingStatusResponseData>>(
      API_ENDPOINTS.onboarding.status
    );

    return {
      isOnboardingComplete: Boolean(response.data?.is_onboarding_complete),
      steps: response.data?.steps ?? {},
      message: response.message,
    };
  },

  async logout(): Promise<void> {
    if (!shouldUseMock()) {
      try {
        await apiClient.post(API_ENDPOINTS.session.logout);
      } catch (primary) {
        const code = primary instanceof ApiError ? primary.code : undefined;
        const status = primary instanceof ApiError ? primary.status : undefined;
        if (status === 404 || code === 'NOT_FOUND') {
          try {
            await apiClient.post(API_ENDPOINTS.auth.logout, {});
          } catch {
            // Best-effort legacy revoke.
          }
        }
      }
    }

    await tokenManager.clearTokens();
  },
};
