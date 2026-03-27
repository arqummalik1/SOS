export interface Outfit {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  tags: string[];
  isTrending: boolean;
  isFeatured: boolean;
  color: string;
  style: string;
  occasion: string;
  priceRange: string;
}
