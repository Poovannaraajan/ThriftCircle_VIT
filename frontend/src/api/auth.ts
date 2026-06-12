import api from './axios';
import type { User } from '../types/user';

export const googleLogin = async (credential: string) => {
  const response = await api.post<{ access_token: string; user: User }>('/api/auth/google', { credential });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get<User>('/api/auth/me');
  return response.data;
};

export const updatePhone = async (phone_number: string) => {
  const response = await api.patch<User>('/api/auth/me/phone', { phone_number });
  return response.data;
};
