export interface Profile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  profileImage: string | null;
  followers: number;
  following: number;
  totalOutfits: number;
}
