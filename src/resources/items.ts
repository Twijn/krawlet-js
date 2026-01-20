import type { HttpClient } from '../http-client';
import type { Item } from '../types';

/**
 * Items resource for retrieving item listings
 */
export class ItemsResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve all item listings with prices across all shops
   * @returns Array of all items
   */
  async getAll(): Promise<Item[]> {
    const response = await this.client.request<Item[]>('/v1/items');
    return response.data;
  }
}
