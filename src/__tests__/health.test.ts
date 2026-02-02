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
        status: 'healthy',
        timestamp: '2026-01-20T00:00:00Z',
        uptime: 12345,
        version: '1.14.0',
        name: 'krawlet-api',
        services: {
          kromerWs: { status: 'connected' },
          chatbox: { status: 'connected' },
          discord: { status: 'connected' },
        },
      };

      const mockResponse: ApiResponse<HealthResponse> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.14.0',
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
      expect(result.services).toBeDefined();
      expect(result.services.kromerWs.status).toBe('connected');
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
          kromerWs: true,
          chatbox: true,
          discord: true,
        },
        details: {
          timestamp: '2026-01-20T00:00:00Z',
          uptime: 12345,
          version: '1.14.0',
          name: 'krawlet-api',
          memory: {
            heapUsed: '50 MB',
            heapTotal: '100 MB',
            rss: '150 MB',
          },
          node: 'v20.0.0',
          platform: 'linux',
        },
        services: {
          kromerWs: {
            status: 'connected',
            lastConnectedAt: '2026-01-19T12:00:00Z',
            lastTransactionId: 12345,
          },
          chatbox: {
            status: 'connected',
            owner: 'krawlet',
            playerCount: 42,
          },
          discord: {
            status: 'connected',
            username: 'Krawlet#1234',
            commandCount: 15,
          },
        },
      };

      const mockResponse: ApiResponse<DetailedHealthResponse> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.14.0',
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
      expect(result.services).toBeDefined();
      expect(result.services.kromerWs.lastTransactionId).toBe(12345);
      expect(result.checks.kromerWs).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/health/detailed',
        expect.any(Object),
      );
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status from basic health check', async () => {
      const mockData: HealthResponse = {
        status: 'healthy',
        timestamp: '2026-01-20T00:00:00Z',
        uptime: 12345,
        version: '1.14.0',
        name: 'krawlet-api',
        services: {
          kromerWs: { status: 'connected' },
          chatbox: { status: 'disconnected', lastError: 'Connection timeout' },
          discord: { status: 'connected' },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData, meta: {} }),
        headers: new Headers(),
      });

      const result = await health.getServiceStatus('chatbox');

      expect(result.status).toBe('disconnected');
      expect(result.lastError).toBe('Connection timeout');
    });

    it('should return detailed service status when useDetailed is true', async () => {
      const mockData: DetailedHealthResponse = {
        status: 'healthy',
        checks: { database: true, memory: true, kromerWs: true, chatbox: true, discord: true },
        details: {
          timestamp: '2026-01-20T00:00:00Z',
          uptime: 12345,
          version: '1.14.0',
          name: 'krawlet-api',
          memory: { heapUsed: '50 MB', heapTotal: '100 MB', rss: '150 MB' },
          node: 'v20.0.0',
          platform: 'linux',
        },
        services: {
          kromerWs: { status: 'connected', lastConnectedAt: '2026-01-19T12:00:00Z', lastTransactionId: 12345 },
          chatbox: { status: 'connected', owner: 'krawlet', playerCount: 42 },
          discord: { status: 'connected', username: 'Krawlet#1234', commandCount: 15 },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData, meta: {} }),
        headers: new Headers(),
      });

      const result = await health.getServiceStatus('discord', true);

      expect(result.status).toBe('connected');
      expect(result.username).toBe('Krawlet#1234');
      expect(result.commandCount).toBe(15);
    });
  });

  describe('areAllServicesConnected', () => {
    it('should return true when all services are connected', async () => {
      const mockData: HealthResponse = {
        status: 'healthy',
        timestamp: '2026-01-20T00:00:00Z',
        uptime: 12345,
        version: '1.14.0',
        name: 'krawlet-api',
        services: {
          kromerWs: { status: 'connected' },
          chatbox: { status: 'connected' },
          discord: { status: 'connected' },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData, meta: {} }),
        headers: new Headers(),
      });

      const result = await health.areAllServicesConnected();

      expect(result).toBe(true);
    });

    it('should return false when any service is not connected', async () => {
      const mockData: HealthResponse = {
        status: 'degraded',
        timestamp: '2026-01-20T00:00:00Z',
        uptime: 12345,
        version: '1.14.0',
        name: 'krawlet-api',
        services: {
          kromerWs: { status: 'connected' },
          chatbox: { status: 'error', lastError: 'Authentication failed' },
          discord: { status: 'connected' },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData, meta: {} }),
        headers: new Headers(),
      });

      const result = await health.areAllServicesConnected();

      expect(result).toBe(false);
    });
  });

  describe('getServicesStatus', () => {
    it('should return status of all services', async () => {
      const mockData: HealthResponse = {
        status: 'degraded',
        timestamp: '2026-01-20T00:00:00Z',
        uptime: 12345,
        version: '1.14.0',
        name: 'krawlet-api',
        services: {
          kromerWs: { status: 'connected' },
          chatbox: { status: 'connecting' },
          discord: { status: 'disconnected' },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData, meta: {} }),
        headers: new Headers(),
      });

      const result = await health.getServicesStatus();

      expect(result).toEqual({
        kromerWs: 'connected',
        chatbox: 'connecting',
        discord: 'disconnected',
      });
    });
  });
});
