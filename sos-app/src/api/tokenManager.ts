import AsyncStorage from '@react-native-async-storage/async-storage';

export const ACCESS_TOKEN_KEY = 'authAccessToken';
export const REFRESH_TOKEN_KEY = 'authRefreshToken';

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export const tokenManager = {
  async getAccessToken(): Promise<string | null> {
    if (inMemoryAccessToken !== null) {
      return inMemoryAccessToken;
    }

    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    inMemoryAccessToken = token;
    return token;
  },

  async getRefreshToken(): Promise<string | null> {
    if (inMemoryRefreshToken !== null) {
      return inMemoryRefreshToken;
    }

    const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    inMemoryRefreshToken = token;
    return token;
  },

  async setTokens(params: { accessToken?: string | null; refreshToken?: string | null }): Promise<void> {
    const { accessToken, refreshToken } = params;

    if (accessToken !== undefined) {
      inMemoryAccessToken = accessToken;
      if (accessToken) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      } else {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    }

    if (refreshToken !== undefined) {
      inMemoryRefreshToken = refreshToken;
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
  },

  async clearTokens(): Promise<void> {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};
