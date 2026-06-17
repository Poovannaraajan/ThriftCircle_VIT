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
  if (payload.rental_period) formData.append('rental_period', payload.rental_period);
  
  images.forEach(img => formData.append('images', img));
  
  const response = await api.post<Listing>('/api/listings/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getImageUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}/api/listings/uploads/${path.split('/').pop()}`;
};

export const updateListingStatus = async (id: string, status: string): Promise<Listing> => {
  const response = await api.patch<Listing>(`/api/listings/${id}/status`, { status });
  return response.data;
};

export const updateListingDetails = async (id: string, data: any): Promise<Listing> => {
  const response = await api.put<Listing>(`/api/listings/${id}`, data);
  return response.data;
};

export const deleteListing = async (id: string): Promise<void> => {
  await api.delete(`/api/listings/${id}`);
};
