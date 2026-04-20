import { apiClient } from '../api/client';
import { API_CONFIG, buildApiUrl } from '../api/config';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError, toApiError } from '../api/errors';
import { User } from '../models/User.model';
import { prepareFullBodyImageForUpload } from '../utils/prepareFullBodyImageForUpload';
import { prepareProfileImageForUpload } from '../utils/prepareProfileImageForUpload';
import { resolveProfileMediaUrl } from '../utils/resolveProfileMediaUrl';

const PROFILE_IMAGE_LOG = '[SOS_PROFILE_IMAGE]';
const FULL_BODY_IMAGE_LOG = '[SOS_FULL_BODY_IMAGE]';
const ONBOARDING_LOG = '[SOS_ONBOARDING]';
const PROFILE_API_LOG = '[SOS_PROFILE_API]';

/** GET /profile — `data.user` node (snake_case from API). */
type ProfileApiUser = {
  id?: number | string;
  name?: string;
  phone?: string;
  email?: string | null;
  height?: string | number | null;
  weight?: string | number | null;
  date_of_birth?: string | null;
  body_shape?: string | null;
  skin_tone?: string | string[] | null;
  style_preferences?: string[] | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  full_body_image_url?: string | null;
  processed_full_body_image_url?: string | null;
  is_onboarding_complete?: boolean;
};

type ProfileGetEnvelope = {
  success?: boolean;
  message?: string;
  data?: {
    user?: ProfileApiUser;
    roles?: string[];
    permissions?: string[];
  };
};

type ApiUser = Partial<User> & {
  _id?: string;
  date_of_birth?: string;
  body_shape?: string;
  skin_tone?: string | string[] | null;
  style_preferences?: string[] | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  full_body_image_url?: string | null;
  processed_full_body_image_url?: string | null;
  is_onboarding_complete?: boolean;
};

type UploadProfileImageResponse = {
  success?: boolean;
  message?: string;
  data?: {
    profile_image?: string;
    profile_image_url?: string;
  };
};

type UploadFullBodyImageResponse = {
  success?: boolean;
  message?: string;
  data?: {
    full_body_image?: string;
    full_body_image_url?: string;
  };
};

type SaveBasicDetailsPayload = {
  name: string;
  height: string;
  weight: string;
  date_of_birth: string;
};

type SaveBasicDetailsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    user?: ApiUser;
  } | ApiUser;
};

type SaveBodyShapeResponse = {
  success?: boolean;
  message?: string;
  data?: {
    body_shape?: string;
  };
};

type SaveSkinToneStyleResponse = {
  success?: boolean;
  message?: string;
  data?: {
    skin_tone?: string;
    style_preferences?: string[];
  };
};

type OnboardingCompleteResponse = {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown>;
};

const normalizeSkinToneHex = (value: string): string => {
  let hex = value.trim().replace(/^#/, '');
  if (!hex) {
    return '#f5d0a9';
  }
  if (hex.length === 3 && /^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return '#f5d0a9';
  }
  return `#${hex.toLowerCase()}`;
};

const shouldUseMock = (): boolean => API_CONFIG.isUsingFallbackBaseUrl;

const normalizeSkinToneFromApi = (
  skin: string | string[] | null | undefined
): { skinTone: string | null; colorPreferences: string[] } => {
  if (skin == null) {
    return { skinTone: null, colorPreferences: [] };
  }
  if (typeof skin === 'string' && skin.trim()) {
    const t = skin.trim();
    return { skinTone: t, colorPreferences: [t] };
  }
  if (Array.isArray(skin)) {
    const list = skin.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
    return { skinTone: list[0] ?? null, colorPreferences: list };
  }
  return { skinTone: null, colorPreferences: [] };
};

const mapProfileApiUserToUser = (api: ProfileApiUser, local?: Partial<User> | null): User => {
  const { skinTone, colorPreferences } = normalizeSkinToneFromApi(api.skin_tone);
  const profileImage =
    resolveProfileMediaUrl(api.profile_image_url ?? undefined) ??
    resolveProfileMediaUrl(api.profile_image ?? undefined) ??
    null;
  const fullBodyImageUrl =
    resolveProfileMediaUrl(api.full_body_image_url ?? undefined) ??
    resolveProfileMediaUrl(api.processed_full_body_image_url ?? undefined) ??
    null;

  return {
    id: String(api.id ?? ''),
    phone: api.phone ?? '',
    name: api.name ?? '',
    email: api.email ?? null,
    profileImage,
    height: api.height != null && api.height !== '' ? String(api.height) : '',
    weight: api.weight != null && api.weight !== '' ? String(api.weight) : '',
    dob: api.date_of_birth ? String(api.date_of_birth) : '',
    bodyShape: api.body_shape ?? null,
    skinTone,
    fullBodyImageUrl,
    isOnboardingComplete: Boolean(api.is_onboarding_complete),
    savedOutfits: local?.savedOutfits ?? [],
    stylePreferences: Array.isArray(api.style_preferences)
      ? api.style_preferences.map((s) => String(s))
      : local?.stylePreferences ?? [],
    colorPreferences:
      colorPreferences.length > 0 ? colorPreferences : local?.colorPreferences ?? [],
    budgetRange: local?.budgetRange ?? '',
    wardrobeItems: local?.wardrobeItems ?? [],
  };
};

const unwrapProfilePutResponse = (response: unknown): ProfileApiUser | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }
  const r = response as ProfileGetEnvelope & { user?: ProfileApiUser };
  if (r.data?.user) {
    return r.data.user;
  }
  if ('user' in r && r.user) {
    return r.user;
  }
  return null;
};

const buildPutProfileBody = (patch: Partial<User>): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) {
    body.name = patch.name;
  }
  if (patch.email !== undefined) {
    body.email = patch.email;
  }
  if (patch.height !== undefined) {
    body.height = patch.height;
  }
  if (patch.weight !== undefined) {
    body.weight = patch.weight;
  }
  if (patch.dob !== undefined) {
    body.date_of_birth = patch.dob;
  }
  if (patch.bodyShape !== undefined) {
    body.body_shape = patch.bodyShape;
  }
  if (patch.skinTone !== undefined) {
    body.skin_tone = patch.skinTone;
  } else if (patch.colorPreferences !== undefined && patch.colorPreferences.length > 0) {
    body.skin_tone = patch.colorPreferences[0];
  }
  if (patch.stylePreferences !== undefined) {
    body.style_preferences = patch.stylePreferences;
  }
  return body;
};

const toUser = (input: ApiUser): User =>
  mapProfileApiUserToUser(
    {
      id: input.id ?? input._id,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      height: input.height,
      weight: input.weight,
      date_of_birth: input.dob ?? input.date_of_birth,
      body_shape: input.body_shape ?? input.bodyShape ?? null,
      skin_tone: input.skin_tone ?? input.colorPreferences ?? null,
      style_preferences: input.style_preferences ?? input.stylePreferences ?? [],
      profile_image: input.profile_image ?? null,
      profile_image_url: input.profile_image_url ?? null,
      full_body_image_url: input.full_body_image_url ?? null,
      processed_full_body_image_url: input.processed_full_body_image_url ?? null,
      is_onboarding_complete: input.is_onboarding_complete,
    },
    {
      savedOutfits: input.savedOutfits,
      wardrobeItems: input.wardrobeItems,
      budgetRange: input.budgetRange,
      colorPreferences: input.colorPreferences,
      stylePreferences: input.stylePreferences,
    }
  );

export const userService = {
  async getProfile(local?: Partial<User> | null): Promise<User | null> {
    if (shouldUseMock()) {
      return null;
    }

    const url = buildApiUrl(API_ENDPOINTS.profile.detail);
    console.log(`${PROFILE_API_LOG} GET profile`, { url });

    try {
      const response = await apiClient.get<ProfileGetEnvelope>(API_ENDPOINTS.profile.detail);
      const userNode = response.data?.user;
      if (!userNode) {
        console.warn(`${PROFILE_API_LOG} GET profile: missing data.user`);
        return null;
      }
      const mapped = mapProfileApiUserToUser(userNode, local ?? undefined);
      console.log(`${PROFILE_API_LOG} GET profile OK`, { id: mapped.id });
      return mapped;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${PROFILE_API_LOG} GET profile failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
        });
      } else {
        console.error(`${PROFILE_API_LOG} GET profile failed`, error);
      }
      throw error;
    }
  },

  async updateProfile(data: Partial<User>, merge?: Partial<User> | null): Promise<User> {
    if (shouldUseMock()) {
      return toUser({ ...(merge as ApiUser), ...data } as ApiUser);
    }

    const body = buildPutProfileBody(data);
    const url = buildApiUrl(API_ENDPOINTS.profile.detail);
    console.log(`${PROFILE_API_LOG} PUT profile`, { url, keys: Object.keys(body) });

    try {
      const response = await apiClient.put<ProfileGetEnvelope | ProfileApiUser>(
        API_ENDPOINTS.profile.detail,
        body
      );
      let userNode = unwrapProfilePutResponse(response);
      if (!userNode) {
        const refetched = await userService.getProfile({ ...merge, ...data });
        if (!refetched) {
          throw toApiError(new Error('Profile updated but response could not be read.'), 'Please reopen your profile.');
        }
        return refetched;
      }
      const mapped = mapProfileApiUserToUser(userNode, { ...merge, ...data });
      console.log(`${PROFILE_API_LOG} PUT profile OK`, { id: mapped.id });
      return mapped;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${PROFILE_API_LOG} PUT profile failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
        });
      } else {
        console.error(`${PROFILE_API_LOG} PUT profile failed`, error);
      }
      throw error;
    }
  },

  async saveProfileSetup(data: Partial<User>): Promise<User> {
    if (shouldUseMock()) {
      return toUser(data);
    }

    const response = await apiClient.post<ApiUser | { data?: ApiUser }>(
      API_ENDPOINTS.user.profileSetup,
      data
    );
    const payload = response && typeof response === 'object' && 'data' in response && response.data
      ? response.data
      : response;
    return toUser(payload as ApiUser);
  },

  /** POST `/onboarding/complete` — authenticated, no request body (matches Hoppscotch Step 6). */
  async markOnboardingComplete(): Promise<{ success: boolean; message?: string }> {
    if (shouldUseMock()) {
      console.log(`${ONBOARDING_LOG} mock onboarding complete skipped`);
      return { success: true, message: 'Onboarding completed' };
    }

    const url = buildApiUrl(API_ENDPOINTS.onboarding.complete);
    console.log(`${ONBOARDING_LOG} POST onboarding/complete (no body)`, { url });

    try {
      const response = await apiClient.post<OnboardingCompleteResponse>(
        API_ENDPOINTS.onboarding.complete
      );
      const normalized = {
        success: response.success ?? true,
        message: response.message,
      };
      console.log(`${ONBOARDING_LOG} onboarding/complete OK`, normalized);
      return normalized;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${ONBOARDING_LOG} onboarding/complete failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        });
      } else {
        console.error(`${ONBOARDING_LOG} onboarding/complete failed`, error);
      }
      throw error;
    }
  },

  async uploadProfileImage(profileImageUri: string): Promise<{
    success: boolean;
    message: string;
    profileImage?: string;
    profileImageUrl?: string;
  }> {
    if (shouldUseMock()) {
      console.log(
        `${PROFILE_IMAGE_LOG} mock upload (skipped API). Set EXPO_PUBLIC_API_BASE_URL to your API host.`,
        { filename: profileImageUri.split('/').pop() }
      );
      return {
        success: true,
        message: 'Profile image uploaded successfully',
        profileImageUrl: profileImageUri,
      };
    }

    let prepared: { uri: string; filename: string; mimeType: string };
    try {
      prepared = await prepareProfileImageForUpload(profileImageUri);
    } catch (prepError) {
      console.error(`${PROFILE_IMAGE_LOG} prepare failed`, prepError);
      throw toApiError(prepError, 'Could not process this image. Try another photo.');
    }
    const url = buildApiUrl(API_ENDPOINTS.onboarding.profileImage);

    const formData = new FormData();
    formData.append(
      'profile_image',
      {
        uri: prepared.uri,
        name: prepared.filename,
        type: prepared.mimeType,
      } as any
    );

    console.log(`${PROFILE_IMAGE_LOG} POST multipart (Hoppscotch contract)`, {
      url,
      formField: 'profile_image',
      filename: prepared.filename,
      mimeType: prepared.mimeType,
    });

    try {
      const response = await apiClient.post<UploadProfileImageResponse>(
        API_ENDPOINTS.onboarding.profileImage,
        formData
      );

      const normalized = {
        success: response.success ?? true,
        message: response.message ?? 'Profile image uploaded successfully',
        profileImage: response.data?.profile_image,
        profileImageUrl: response.data?.profile_image_url,
      };

      console.log(`${PROFILE_IMAGE_LOG} upload OK`, {
        success: normalized.success,
        message: normalized.message,
        profile_image: normalized.profileImage,
        profile_image_url: normalized.profileImageUrl,
        rawDataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : [],
      });

      return normalized;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${PROFILE_IMAGE_LOG} upload failed (ApiError)`, {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        });
      } else {
        console.error(`${PROFILE_IMAGE_LOG} upload failed`, error);
      }
      throw error;
    }
  },

  async uploadFullBodyImage(fullBodyImageUri: string): Promise<{
    success: boolean;
    message: string;
    fullBodyImage?: string;
    fullBodyImageUrl?: string;
  }> {
    if (shouldUseMock()) {
      console.log(`${FULL_BODY_IMAGE_LOG} mock upload (skipped API).`, {
        filename: fullBodyImageUri.split('/').pop(),
      });
      return {
        success: true,
        message: 'Full body image uploaded successfully',
        fullBodyImageUrl: fullBodyImageUri,
      };
    }

    let prepared: { uri: string; filename: string; mimeType: string };
    try {
      prepared = await prepareFullBodyImageForUpload(fullBodyImageUri);
    } catch (prepError) {
      console.error(`${FULL_BODY_IMAGE_LOG} prepare failed`, prepError);
      throw toApiError(prepError, 'Could not process this photo. Try another image.');
    }

    const url = buildApiUrl(API_ENDPOINTS.onboarding.fullBodyImage);
    const formData = new FormData();
    formData.append(
      'full_body_image',
      {
        uri: prepared.uri,
        name: prepared.filename,
        type: prepared.mimeType,
      } as any
    );

    console.log(`${FULL_BODY_IMAGE_LOG} POST multipart`, {
      url,
      formField: 'full_body_image',
      filename: prepared.filename,
      mimeType: prepared.mimeType,
    });

    try {
      const response = await apiClient.post<UploadFullBodyImageResponse>(
        API_ENDPOINTS.onboarding.fullBodyImage,
        formData
      );

      const normalized = {
        success: response.success ?? true,
        message: response.message ?? 'Full body image uploaded successfully',
        fullBodyImage: response.data?.full_body_image,
        fullBodyImageUrl: response.data?.full_body_image_url,
      };

      console.log(`${FULL_BODY_IMAGE_LOG} upload OK`, {
        success: normalized.success,
        message: normalized.message,
        full_body_image: normalized.fullBodyImage,
        full_body_image_url: normalized.fullBodyImageUrl,
      });

      return normalized;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${FULL_BODY_IMAGE_LOG} upload failed (ApiError)`, {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        });
      } else {
        console.error(`${FULL_BODY_IMAGE_LOG} upload failed`, error);
      }
      throw error;
    }
  },

  async saveOnboardingBasicDetails(payload: SaveBasicDetailsPayload): Promise<{
    success: boolean;
    message: string;
    user?: User;
  }> {
    if (shouldUseMock()) {
      return {
        success: true,
        message: 'Basic details saved successfully',
      };
    }

    const response = await apiClient.patch<SaveBasicDetailsResponse>(
      API_ENDPOINTS.onboarding.basicDetails,
      payload
    );

    const userPayload =
      response.data && typeof response.data === 'object' && 'user' in response.data
        ? response.data.user
        : response.data;

    return {
      success: response.success ?? true,
      message: response.message ?? 'Basic details saved successfully',
      user: userPayload ? toUser(userPayload as ApiUser) : undefined,
    };
  },

  async saveOnboardingBodyShape(params: {
    bodyShape: string;
    customBodyShape?: string;
  }): Promise<{ success: boolean; message: string; bodyShape?: string }> {
    if (shouldUseMock()) {
      console.log(`${ONBOARDING_LOG} mock body-shape PATCH skipped`);
      return {
        success: true,
        message: 'Body shape saved successfully',
        bodyShape: params.bodyShape,
      };
    }

    const form = new FormData();
    form.append('body_shape', params.bodyShape.trim().toLowerCase());
    form.append('custom_body_shape', (params.customBodyShape ?? '').trim());

    console.log(`${ONBOARDING_LOG} PATCH multipart body-shape`, {
      url: buildApiUrl(API_ENDPOINTS.onboarding.bodyShape),
      body_shape: params.bodyShape.trim().toLowerCase(),
      hasCustom: Boolean((params.customBodyShape ?? '').trim()),
    });

    try {
      const response = await apiClient.patch<SaveBodyShapeResponse>(
        API_ENDPOINTS.onboarding.bodyShape,
        form
      );
      const normalized = {
        success: response.success ?? true,
        message: response.message ?? 'Body shape saved successfully',
        bodyShape: response.data?.body_shape ?? params.bodyShape,
      };
      console.log(`${ONBOARDING_LOG} body-shape OK`, normalized);
      return normalized;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${ONBOARDING_LOG} body-shape failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        });
      } else {
        console.error(`${ONBOARDING_LOG} body-shape failed`, error);
      }
      throw error;
    }
  },

  async saveOnboardingSkinToneStyle(params: {
    skinTone: string;
    stylePreferences: string[];
  }): Promise<{ success: boolean; message: string; skinTone?: string; stylePreferences?: string[] }> {
    if (shouldUseMock()) {
      console.log(`${ONBOARDING_LOG} mock skin-tone-style PATCH skipped`);
      return {
        success: true,
        message: 'Skin tone and style preferences saved successfully',
        skinTone: params.skinTone,
        stylePreferences: params.stylePreferences,
      };
    }

    const form = new FormData();
    const tone = normalizeSkinToneHex(params.skinTone);
    form.append('skin_tone', tone);

    const prefs = params.stylePreferences.map((p) => p.trim().toLowerCase()).filter(Boolean);
    for (const pref of prefs) {
      form.append('style_preferences[]', pref);
    }

    console.log(`${ONBOARDING_LOG} PATCH multipart skin-tone-style`, {
      url: buildApiUrl(API_ENDPOINTS.onboarding.skinToneStyle),
      skin_tone: tone,
      style_preferences: prefs,
    });

    try {
      const response = await apiClient.patch<SaveSkinToneStyleResponse>(
        API_ENDPOINTS.onboarding.skinToneStyle,
        form
      );
      const normalized = {
        success: response.success ?? true,
        message: response.message ?? 'Skin tone and style preferences saved successfully',
        skinTone: response.data?.skin_tone ?? tone,
        stylePreferences: response.data?.style_preferences ?? prefs,
      };
      console.log(`${ONBOARDING_LOG} skin-tone-style OK`, normalized);
      return normalized;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${ONBOARDING_LOG} skin-tone-style failed`, {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        });
      } else {
        console.error(`${ONBOARDING_LOG} skin-tone-style failed`, error);
      }
      throw error;
    }
  },
};
