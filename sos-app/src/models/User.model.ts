export interface User {
  id: string;
  phone: string;
  name: string;
  profileImage: string | null;
  height: string;
  weight: string;
  dob: string;
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
