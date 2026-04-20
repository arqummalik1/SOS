export interface User {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  profileImage: string | null;
  height: string;
  weight: string;
  dob: string;
  bodyShape: string | null;
  skinTone: string | null;
  fullBodyImageUrl: string | null;
  /** Server onboarding flag when provided by GET /profile. */
  isOnboardingComplete?: boolean;
  savedOutfits: string[];
  stylePreferences: string[];
  colorPreferences: string[];
  budgetRange: string;
  wardrobeItems: string[];
}

export interface ProfileSetupData {
  name: string;
  height: string;
  weight: string;
  dob: { day: string; month: string; year: string };
  profileImage: string | null;
  stylePreferences: string[];
  colorPreferences: string[];
  budgetRange: string;
}
