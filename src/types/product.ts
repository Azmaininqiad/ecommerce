export type Product = {
  id: number;
  title: string;
  description?: string;
  price: number;
  discounted_price?: number;
  reviews_count: number;
  rating: number;
  category?: string;
  brand?: string;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export type ProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  image_type: 'thumbnail' | 'preview' | 'main';
  sort_order: number;
  alt_text?: string;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
};

export type ProductReview = {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  review_text?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

// Legacy type for backward compatibility
export type LegacyProduct = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
