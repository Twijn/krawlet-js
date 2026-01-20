import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClient } from '../http-client';
import type { ApiResponse, Player } from '../types';

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
      apiKey: 'test_key',
      timeout: 5000,
    });
    vi.clearAllMocks();
  });

  describe('request', () => {
    it('should make a successful GET request', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [
          {
            minecraftUUID: 'd98440d6-5117-4ac8-bd50-70b086101e3e',
            minecraftName: 'Twijn',
            kromerAddress: 'ks0d5iqb6p',
            notifications: 'all',
            createdDate: '2026-01-01T00:00:00Z',
            updatedDate: '2026-01-01T00:00:00Z',
            online: true,
          },
        ],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-123',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '999',
          'X-RateLimit-Reset': '1737331200',
        }),
      });

      const response = await client.request<Player[]>('/v1/players');

      expect(response).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test_key',
          }),
        }),
      );
    });

    it('should include query parameters in GET request', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-124',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      await client.request<Player[]>('/v1/players', {
        params: { names: 'Twijn,Player2' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players?names=Twijn%2CPlayer2',
        expect.any(Object),
      );
    });

    it('should make a POST request with body', async () => {
      const mockResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Shop created' },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 50,
          version: '1.0.0',
          requestId: 'req-125',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const shopData = {
        info: {
          name: 'Test Shop',
          computerID: 123,
        },
        items: [],
      };

      await client.request('/v1/shops', {
        method: 'POST',
        body: shopData,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/shops',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(shopData),
        }),
      );
    });

    it('should extract and store rate limit information', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-126',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({
          'X-RateLimit-Limit': '5000',
          'X-RateLimit-Remaining': '4999',
          'X-RateLimit-Reset': '1737334800',
        }),
      });

      await client.request<Player[]>('/v1/players');

      const rateLimit = client.getRateLimit();
      expect(rateLimit).toEqual({
        limit: 5000,
        remaining: 4999,
        reset: 1737334800,
      });
    });

    it('should handle 404 errors', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'SHOP_NOT_FOUND',
          message: 'Shop not found',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-127',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
        headers: new Headers(),
      });

      await expect(client.request('/v1/shops/999')).rejects.toThrow('Shop not found');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(client.request('/v1/players')).rejects.toThrow();
    });

    it('should retry on 5xx errors', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-128',
        },
      };

      const successResponse: ApiResponse<Player[]> = {
        success: true,
        data: [],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-129',
        },
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => errorResponse,
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => successResponse,
          headers: new Headers(),
        });

      const response = await client.request<Player[]>('/v1/players');
      expect(response).toEqual(successResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx client errors', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Bad request',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-130',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
        headers: new Headers(),
      });

      await expect(client.request('/v1/players')).rejects.toThrow('Bad request');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should use custom API key for individual request', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-131',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      await client.request<Player[]>('/v1/players', {
        apiKey: 'override_key',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer override_key',
          }),
        }),
      );
    });
  });
});
