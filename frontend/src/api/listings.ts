import api from './axios';
import type { Category, Listing, ListingsResponse, ListingFilters, CreateListingPayload } from '../types/listing';

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/api/listings/categories');
  return response.data;
};

export const fetchListings = async (filters: ListingFilters = {}): Promise<ListingsResponse> => {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  }
  
  const response = await api.get<ListingsResponse>('/api/listings/', { params });
  return response.data;
};

export const fetchListing = async (id: string): Promise<Listing> => {
  const response = await api.get<Listing>(`/api/listings/${id}`);
  return response.data;
};

export const fetchMyListings = async (): Promise<Listing[]> => {
  const response = await api.get<Listing[]>('/api/listings/my');
  return response.data;
};

export const createListing = async (payload: CreateListingPayload, images: File[]): Promise<Listing> => {
  const formData = new FormData();
  
  formData.append('title', payload.title);
  formData.append('listing_type', payload.listing_type);
  formData.append('category_id', String(payload.category_id));
  
  if (payload.description) formData.append('description', payload.description);
  if (payload.price !== undefined && payload.price !== null) formData.append('price', String(payload.price));
  if (payload.condition) formData.append('condition', payload.condition);
  
  images.forEach(img => formData.append('images', img));
  
  const response = await api.post<Listing>('/api/listings/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getImageUrl = (relativePath: string): string => {
  if (!relativePath) return '';
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}/api/listings/${relativePath}`;
};
