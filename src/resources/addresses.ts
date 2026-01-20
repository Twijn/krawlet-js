import type { HttpClient } from '../http-client';
import type { KnownAddress } from '../types';

/**
 * Addresses resource for retrieving known Kromer addresses
 */
export class AddressesResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve all known Kromer addresses
   * @returns Array of all known addresses
   */
  async getAll(): Promise<KnownAddress[]> {
    const response = await this.client.request<KnownAddress[]>('/v1/addresses');
    return response.data;
  }
}
