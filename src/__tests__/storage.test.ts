import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageResource } from '../resources/storage';
import { HttpClient } from '../http-client';
import type { ApiResponse, StorageData } from '../types';

describe('StorageResource', () => {
  let client: HttpClient;
  let storage: StorageResource;

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
    });
    storage = new StorageResource(client);
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return stored ender storage data', async () => {
      const mockData: StorageData = {
        data: {
          items: ['minecraft:diamond', 'minecraft:emerald'],
          owner: 'Twijn',
        },
        retrievedAt: '2026-01-20T00:00:00Z',
      };

      const mockResponse: ApiResponse<StorageData> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 8,
          version: '1.0.0',
          requestId: 'req-700',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await storage.get();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/storage',
        expect.any(Object),
      );
    });

    it('should throw error when no data stored', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No storage data found',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-701',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
        headers: new Headers(),
      });

      await expect(storage.get()).rejects.toThrow('No storage data found');
    });
  });

  describe('set', () => {
    it('should store ender storage data with authentication', async () => {
      const mockResponse: ApiResponse<{ message: string; timestamp: string }> = {
        success: true,
        data: {
          message: 'Storage data saved successfully',
          timestamp: '2026-01-20T00:00:00Z',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 20,
          version: '1.0.0',
          requestId: 'req-702',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const storageData = {
        items: ['minecraft:diamond'],
        count: 64,
      };

      await storage.set(storageData, 'storage_token');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/storage',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer storage_token',
          }),
          body: JSON.stringify(storageData),
        }),
      );
    });

    it('should throw error when unauthorized', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid storage token',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-703',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
        headers: new Headers(),
      });

      await expect(storage.set({ data: 'test' }, 'invalid_token')).rejects.toThrow(
        'Invalid storage token',
      );
    });

    it('should handle complex storage data', async () => {
      const mockResponse: ApiResponse<{ message: string; timestamp: string }> = {
        success: true,
        data: {
          message: 'Storage data saved successfully',
          timestamp: '2026-01-20T00:00:00Z',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 25,
          version: '1.0.0',
          requestId: 'req-704',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const complexData = {
        enderChests: [
          {
            slot: 0,
            items: [
              { type: 'minecraft:diamond', count: 64 },
              { type: 'minecraft:emerald', count: 32 },
            ],
          },
        ],
        metadata: {
          owner: 'Twijn',
          lastUpdated: '2026-01-20T00:00:00Z',
        },
      };

      await storage.set(complexData, 'storage_token');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/storage',
        expect.objectContaining({
          body: JSON.stringify(complexData),
        }),
      );
    });
  });
});
