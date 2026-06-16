export type ListingType = 'sell' | 'lend' | 'free';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'active' | 'reserved' | 'sold' | 'expired';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export interface SellerSummary {
  id: string;
  name: string;
  avatar_url: string | null;
  email?: string;
  phone_number?: string;
  reg_no?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  listing_type: ListingType;
  condition: ListingCondition | null;
  status: ListingStatus;
  image_urls: string[];
  category: Category | null;
  seller_id: string;
  seller?: SellerSummary;
  expires_at: string;
  created_at: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ListingFilters {
  page?: number;
  per_page?: number;
  category_id?: number | null;
  listing_type?: ListingType | null;
  min_price?: number | null;
  max_price?: number | null;
  q?: string | null;
  status?: ListingStatus;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  price?: number | null;
  listing_type: ListingType;
  condition?: ListingCondition | null;
  category_id: number;
}
