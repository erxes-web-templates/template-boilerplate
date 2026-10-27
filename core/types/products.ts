export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  category: string;
  inStock: boolean;
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
}
