import type { HttpClient } from '../http-client';
import type { Shop, Item, ShopSyncData } from '../types';

/**
 * Shops resource for managing shop data
 */
export class ShopsResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve all shops with their items and addresses
   * @returns Array of all shops
   */
  async getAll(): Promise<Shop[]> {
    const response = await this.client.request<Shop[]>('/v1/shops');
    return response.data;
  }

  /**
   * Retrieve a specific shop by ID
   * @param id - Shop ID (computer ID)
   * @returns Shop data
   * @throws KrawletError with SHOP_NOT_FOUND if shop doesn't exist
   */
  async get(id: string): Promise<Shop> {
    const response = await this.client.request<Shop>(`/v1/shops/${id}`);
    return response.data;
  }

  /**
   * Retrieve all items for a specific shop
   * @param id - Shop ID
   * @returns Array of items in the shop
   */
  async getItems(id: string): Promise<Item[]> {
    const response = await this.client.request<Item[]>(`/v1/shops/${id}/items`);
    return response.data;
  }

  /**
   * Create or update a shop (requires ShopSync authentication)
   * @param data - Shop sync data
   * @param token - ShopSync API token
   * @returns Success message
   * @throws KrawletError with VALIDATION_ERROR if data is invalid
   * @throws KrawletError with UNAUTHORIZED if not authenticated
   */
  async update(data: ShopSyncData, token: string): Promise<{ message: string }> {
    const response = await this.client.request<{ message: string }>('/v1/shops', {
      method: 'POST',
      body: data,
      apiKey: token,
    });
    return response.data;
  }
}
