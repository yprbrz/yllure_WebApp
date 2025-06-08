import type { Size } from '@prisma/client';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

export interface Dress {
  id: string;
  name: string;
  description: string;
  price: number;
  size: Size;
  available: boolean;
  frontImage: string;
  backImage: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  name: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  dressId: string;
  createdAt: string;
  dress: Dress;
}

// Filter types
export interface DressFilters {
  size?: Size;
  available?: boolean;
}

// API Functions
class DressAPI {
  private getBaseUrl() {
    // Use absolute URL in browser, relative in server
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api`;
    }
    return '/api';
  }

  async fetchDresses(filters?: DressFilters): Promise<ApiResponse<Dress[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.size) params.append('size', filters.size);
      if (filters?.available !== undefined) params.append('available', filters.available.toString());

      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/dresses${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dresses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dresses'
      };
    }
  }

  async fetchDress(id: string): Promise<ApiResponse<Dress>> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/dresses/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dress'
      };
    }
  }

  async fetchAvailableDresses(): Promise<ApiResponse<Dress[]>> {
    return this.fetchDresses({ available: true });
  }
}

class WishlistAPI {
  private getBaseUrl() {
    // Use absolute URL in browser, relative in server
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api`;
    }
    return '/api';
  }

  async createWishlist(name?: string): Promise<ApiResponse<Wishlist>> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/wishlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name || 'My Wishlist' }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating wishlist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create wishlist'
      };
    }
  }

  async fetchWishlist(id: string): Promise<ApiResponse<Wishlist>> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/wishlists/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wishlist'
      };
    }
  }

  async addToWishlist(wishlistId: string, dressId: string): Promise<ApiResponse<WishlistItem>> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/wishlists/${wishlistId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dressId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add to wishlist'
      };
    }
  }

  async removeFromWishlist(wishlistId: string, dressId: string): Promise<ApiResponse<void>> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/wishlists/${wishlistId}/items?dressId=${dressId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove from wishlist'
      };
    }
  }
}

// Export singleton instances
export const dressAPI = new DressAPI();
export const wishlistAPI = new WishlistAPI();