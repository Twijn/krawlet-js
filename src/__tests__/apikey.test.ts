import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyResource } from '../resources/apikey';
import { HttpClient } from '../http-client';
import type { ApiResponse, ApiKeyInfo, ApiKeyUsage, RequestLogsResponse } from '../types';

describe('ApiKeyResource', () => {
  let client: HttpClient;
  let apiKey: ApiKeyResource;

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
      apiKey: 'kraw_test_key',
    });
    apiKey = new ApiKeyResource(client);
    vi.clearAllMocks();
  });

  describe('getInfo', () => {
    const mockApiKeyInfo: ApiKeyInfo = {
      id: 'key-123',
      name: 'Test API Key',
      email: 'test@example.com',
      tier: 'premium',
      rateLimit: 1000,
      isActive: true,
      requestCount: 5000,
      lastUsedAt: '2026-01-20T12:00:00Z',
      createdAt: '2025-01-01T00:00:00Z',
      usage: {
        totalRequests: 5000,
        last24h: 100,
        last7d: 500,
        last30d: 2000,
        blockedRequests: 5,
        avgResponseTimeMs: 150,
        topEndpoints: [
          { path: '/v1/shops', count: 2500 },
          { path: '/v1/items', count: 1500 },
        ],
      },
    };

    it('should return API key info with usage by default', async () => {
      const mockResponse: ApiResponse<ApiKeyInfo> = {
        success: true,
        data: mockApiKeyInfo,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-100',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await apiKey.getInfo();

      expect(result).toEqual(mockApiKeyInfo);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/apikey',
        expect.any(Object),
      );
    });

    it('should pass usage=false query parameter when specified', async () => {
      const mockInfoWithoutUsage: ApiKeyInfo = {
        ...mockApiKeyInfo,
        usage: undefined,
      };

      const mockResponse: ApiResponse<ApiKeyInfo> = {
        success: true,
        data: mockInfoWithoutUsage,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-101',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await apiKey.getInfo({ usage: false });

      expect(result).toEqual(mockInfoWithoutUsage);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/apikey?usage=false',
        expect.any(Object),
      );
    });

    it('should pass usage=true query parameter when specified', async () => {
      const mockResponse: ApiResponse<ApiKeyInfo> = {
        success: true,
        data: mockApiKeyInfo,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-102',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await apiKey.getInfo({ usage: true });

      expect(result).toEqual(mockApiKeyInfo);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/apikey?usage=true',
        expect.any(Object),
      );
    });
  });

  describe('getUsage', () => {
    const mockUsage: ApiKeyUsage = {
      totalRequests: 5000,
      last24h: 100,
      last7d: 500,
      last30d: 2000,
      blockedRequests: 5,
      avgResponseTimeMs: 150,
      topEndpoints: [
        { path: '/v1/shops', count: 2500 },
        { path: '/v1/items', count: 1500 },
        { path: '/v1/players', count: 1000 },
      ],
    };

    it('should return usage statistics', async () => {
      const mockResponse: ApiResponse<ApiKeyUsage> = {
        success: true,
        data: mockUsage,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 15,
          version: '1.0.0',
          requestId: 'req-200',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await apiKey.getUsage();

      expect(result).toEqual(mockUsage);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/apikey/usage',
        expect.any(Object),
      );
    });
  });

  describe('getLogs', () => {
    const mockLogs: RequestLogsResponse = {
      count: 3,
      logs: [
        {
          requestId: 'req-001',
          timestamp: '2026-01-20T12:00:00Z',
          method: 'GET',
          path: '/v1/shops',
          responseStatus: 200,
          responseTimeMs: 45,
          wasBlocked: false,
          blockReason: null,
        },
        {
          requestId: 'req-002',
          timestamp: '2026-01-20T11:55:00Z',
          method: 'GET',
          path: '/v1/items',
          responseStatus: 200,
          responseTimeMs: 120,
          wasBlocked: false,
          blockReason: null,
        },
        {
          requestId: 'req-003',
          timestamp: '2026-01-20T11:50:00Z',
          method: 'GET',
          path: '/v1/players',
          responseStatus: 429,
          responseTimeMs: null,
          wasBlocked: true,
          blockReason: 'RATE_LIMIT_EXCEEDED',
        },
      ],
    };

    it('should return request logs with default limit', async () => {
      const mockResponse: ApiResponse<RequestLogsResponse> = {
        success: true,
        data: mockLogs,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 20,
          version: '1.0.0',
          requestId: 'req-300',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await apiKey.getLogs();

      expect(result).toEqual(mockLogs);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/apikey/logs',
        expect.any(Object),
      );
    });

    it('should pass limit query parameter when specified', async () => {
      const mockResponse: ApiResponse<RequestLogsResponse> = {
        success: true,
        data: mockLogs,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 15,
          version: '1.0.0',
          requestId: 'req-301',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await apiKey.getLogs({ limit: 10 });

      expect(result).toEqual(mockLogs);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/apikey/logs?limit=10',
        expect.any(Object),
      );
    });
  });
});
