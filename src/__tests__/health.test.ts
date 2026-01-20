import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthResource } from '../resources/health';
import { HttpClient } from '../http-client';
import type { ApiResponse, HealthResponse, DetailedHealthResponse } from '../types';

describe('HealthResource', () => {
  let client: HttpClient;
  let health: HealthResource;

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
    });
    health = new HealthResource(client);
    vi.clearAllMocks();
  });

  describe('check', () => {
    it('should return basic health status', async () => {
      const mockData: HealthResponse = {
        status: 'ok',
        timestamp: '2026-01-20T00:00:00Z',
        uptime: 12345,
        version: '1.0.0',
        name: 'Krawlet API',
      };

      const mockResponse: ApiResponse<HealthResponse> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-200',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await health.check();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/health',
        expect.any(Object),
      );
    });
  });

  describe('detailed', () => {
    it('should return detailed health status', async () => {
      const mockData: DetailedHealthResponse = {
        status: 'healthy',
        checks: {
          database: true,
          memory: true,
        },
        details: {
          timestamp: '2026-01-20T00:00:00Z',
          uptime: 12345,
          version: '1.0.0',
          name: 'Krawlet API',
          memory: {
            heapUsed: '50 MB',
            heapTotal: '100 MB',
            rss: '150 MB',
          },
          node: 'v20.0.0',
          platform: 'linux',
        },
      };

      const mockResponse: ApiResponse<DetailedHealthResponse> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-201',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await health.detailed();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/health/detailed',
        expect.any(Object),
      );
    });
  });
});
