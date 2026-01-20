import type { HttpClient } from '../http-client';
import type { StorageData } from '../types';

/**
 * Storage resource for managing ender storage data
 */
export class StorageResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve the last stored ender storage data
   * @returns Storage data and retrieval timestamp
   * @throws KrawletError with NOT_FOUND if no data has been stored yet
   */
  async get(): Promise<StorageData> {
    const response = await this.client.request<StorageData>('/v1/storage');
    return response.data;
  }

  /**
   * Store ender storage data (requires authentication)
   * @param data - Any JSON object to store
   * @param token - Ender Storage API token
   * @returns Success message and timestamp
   * @throws KrawletError with BAD_REQUEST if data is invalid
   * @throws KrawletError with UNAUTHORIZED if not authenticated
   */
  async set(data: unknown, token: string): Promise<{ message: string; timestamp: string }> {
    const response = await this.client.request<{ message: string; timestamp: string }>(
      '/v1/storage',
      {
        method: 'POST',
        body: data,
        apiKey: token,
      },
    );
    return response.data;
  }
}
