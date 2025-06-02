import type { Dress } from '@prisma/client';

export type { Dress };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getDressById = async (id: number): Promise<Dress | null> => {
  const response = await fetch(`${API_URL}/dresses/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch dress');
  }
  return response.json();
};

export const getFeaturedDresses = async (): Promise<Dress[]> => {
  const response = await fetch(`${API_URL}/dresses?featured=true`);
  if (!response.ok) {
    throw new Error('Failed to fetch featured dresses');
  }
  return response.json();
};

export const getAllDresses = async (): Promise<Dress[]> => {
  const response = await fetch(`${API_URL}/dresses`);
  if (!response.ok) {
    throw new Error('Failed to fetch dresses');
  }
  return response.json();
};