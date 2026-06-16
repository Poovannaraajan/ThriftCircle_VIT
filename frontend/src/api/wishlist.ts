import api from './axios';
import type { Listing } from '../types/listing';

interface WishlistResponse {
  own_listings: Listing[];
  other_listings: Listing[];
  expired_listings: Listing[];
}

export const fetchWishlist = async (): Promise<WishlistResponse> => {
  const { data } = await api.get('/api/wishlist/');
  return data;
};

export const fetchWishlistIds = async (): Promise<string[]> => {
  const { data } = await api.get('/api/wishlist/ids');
  return data.wishlist_ids;
};

export const addToWishlist = async (listing_id: string): Promise<void> => {
  await api.post('/api/wishlist/', { listing_id });
};

export const removeFromWishlist = async (listing_id: string): Promise<void> => {
  await api.delete(`/api/wishlist/${listing_id}`);
};
