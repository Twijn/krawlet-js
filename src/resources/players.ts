import type { HttpClient } from '../http-client';
import type { Player } from '../types';

/**
 * Players resource for managing player data
 */
export class PlayersResource {
  constructor(private client: HttpClient) {}

  /**
   * Retrieve all players
   * @returns Array of all players
   */
  async getAll(): Promise<Player[]> {
    const response = await this.client.request<Player[]>('/v1/players');
    return response.data;
  }

  /**
   * Retrieve players by Kromer addresses
   * @param addresses - Array of Kromer addresses
   * @returns Array of matching players
   */
  async getByAddresses(addresses: string[]): Promise<Player[]> {
    const response = await this.client.request<Player[]>('/v1/players', {
      params: {
        addresses: addresses.join(','),
      },
    });
    return response.data;
  }

  /**
   * Retrieve players by Minecraft names
   * @param names - Array of player names (case-insensitive)
   * @returns Array of matching players
   */
  async getByNames(names: string[]): Promise<Player[]> {
    const response = await this.client.request<Player[]>('/v1/players', {
      params: {
        names: names.join(','),
      },
    });
    return response.data;
  }

  /**
   * Retrieve players by Minecraft UUIDs
   * @param uuids - Array of player UUIDs
   * @returns Array of matching players
   */
  async getByUuids(uuids: string[]): Promise<Player[]> {
    const response = await this.client.request<Player[]>('/v1/players', {
      params: {
        uuids: uuids.join(','),
      },
    });
    return response.data;
  }
}
