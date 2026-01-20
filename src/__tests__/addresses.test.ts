import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddressesResource } from '../resources/addresses';
import { HttpClient } from '../http-client';
import type { ApiResponse, KnownAddress } from '../types';

describe('AddressesResource', () => {
  let client: HttpClient;
  let addresses: AddressesResource;

  const mockAddress: KnownAddress = {
    id: 'addr-1',
    type: 'official',
    address: 'khugepowr',
    imageSrc: 'https://example.com/logo.png',
    name: 'Official Treasury',
    description: 'Main Krawler treasury address',
    createdDate: '2026-01-01T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
  };

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
    });
    addresses = new AddressesResource(client);
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all known addresses', async () => {
      const mockResponse: ApiResponse<KnownAddress[]> = {
        success: true,
        data: [mockAddress],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 12,
          version: '1.0.0',
          requestId: 'req-600',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await addresses.getAll();

      expect(result).toEqual([mockAddress]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/addresses',
        expect.any(Object),
      );
    });

    it('should handle multiple address types', async () => {
      const multipleAddresses: KnownAddress[] = [
        { ...mockAddress, id: 'addr-1', type: 'official' },
        { ...mockAddress, id: 'addr-2', type: 'shop', name: 'Shop Address' },
        { ...mockAddress, id: 'addr-3', type: 'gamble', name: 'Casino' },
        { ...mockAddress, id: 'addr-4', type: 'service', name: 'Service Provider' },
        { ...mockAddress, id: 'addr-5', type: 'company', name: 'Corp Inc' },
      ];

      const mockResponse: ApiResponse<KnownAddress[]> = {
        success: true,
        data: multipleAddresses,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 15,
          version: '1.0.0',
          requestId: 'req-601',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await addresses.getAll();

      expect(result).toHaveLength(5);
      expect(result.map((a) => a.type)).toEqual(['official', 'shop', 'gamble', 'service', 'company']);
    });
  });
});
