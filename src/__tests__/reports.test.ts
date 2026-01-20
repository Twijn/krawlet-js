import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportsResource } from '../resources/reports';
import { HttpClient } from '../http-client';
import type { ApiResponse, ReportRecords, ChangeLogResult } from '../types';

describe('ReportsResource', () => {
  let client: HttpClient;
  let reports: ReportsResource;

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
    });
    reports = new ReportsResource(client);
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return report statistics', async () => {
      const mockStats = {
        totalShops: 150,
        totalItems: 5000,
        totalChanges: 1234,
        successRate: 98.5,
      };

      const mockResponse: ApiResponse<typeof mockStats> = {
        success: true,
        data: mockStats,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 15,
          version: '1.0.0',
          requestId: 'req-800',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getStats();

      expect(result).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/reports/stats',
        expect.any(Object),
      );
    });
  });

  describe('getValidationFailures', () => {
    it('should return validation failures with default limit', async () => {
      const mockData: ReportRecords = {
        count: 5,
        records: [
          { id: 1, error: 'Invalid shop data', timestamp: '2026-01-20T00:00:00Z' },
        ],
      };

      const mockResponse: ApiResponse<ReportRecords> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-801',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getValidationFailures();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('v1/reports/validation-failures'),
        expect.any(Object),
      );
    });

    it('should return validation failures with custom limit', async () => {
      const mockData: ReportRecords = {
        count: 10,
        records: [],
      };

      const mockResponse: ApiResponse<ReportRecords> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-802',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      await reports.getValidationFailures({ limit: 100 });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/reports/validation-failures?limit=100',
        expect.any(Object),
      );
    });
  });

  describe('getSuccessfulPosts', () => {
    it('should return successful posts', async () => {
      const mockData: ReportRecords = {
        count: 50,
        records: [
          { id: 1, shopId: 'shop-1', timestamp: '2026-01-20T00:00:00Z' },
        ],
      };

      const mockResponse: ApiResponse<ReportRecords> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 12,
          version: '1.0.0',
          requestId: 'req-803',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getSuccessfulPosts({ limit: 25 });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/reports/successful-posts?limit=25',
        expect.any(Object),
      );
    });
  });

  describe('getShopChanges', () => {
    it('should return shop changes without filters', async () => {
      const mockData: ReportRecords = {
        count: 20,
        records: [
          { id: 1, shopId: 'shop-1', changeType: 'name', timestamp: '2026-01-20T00:00:00Z' },
        ],
      };

      const mockResponse: ApiResponse<ReportRecords> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 15,
          version: '1.0.0',
          requestId: 'req-804',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getShopChanges();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('v1/reports/shop-changes'),
        expect.any(Object),
      );
    });

    it('should return shop changes with shopId filter', async () => {
      const mockData: ReportRecords = {
        count: 5,
        records: [],
      };

      const mockResponse: ApiResponse<ReportRecords> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 8,
          version: '1.0.0',
          requestId: 'req-805',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      await reports.getShopChanges({ shopId: 'shop-1', limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/reports/shop-changes?limit=10&shopId=shop-1',
        expect.any(Object),
      );
    });
  });

  describe('getItemChanges', () => {
    it('should return item changes', async () => {
      const mockData: ReportRecords = {
        count: 30,
        records: [
          { id: 1, itemName: 'minecraft:diamond', changeType: 'added', timestamp: '2026-01-20T00:00:00Z' },
        ],
      };

      const mockResponse: ApiResponse<ReportRecords> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 18,
          version: '1.0.0',
          requestId: 'req-806',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getItemChanges({ limit: 30 });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/reports/item-changes?limit=30',
        expect.any(Object),
      );
    });
  });

  describe('getShopChangeLogs', () => {
    it('should return shop change logs with all filters', async () => {
      const mockData: ChangeLogResult = {
        count: 15,
        logs: [
          {
            id: 1,
            shopId: 'shop-1',
            shopName: 'Test Shop',
            field: 'name',
            previousValue: 'Old Name',
            newValue: 'New Name',
            isNewShop: false,
            createdAt: '2026-01-20T00:00:00Z',
            updatedAt: '2026-01-20T00:00:00Z',
          },
        ],
      };

      const mockResponse: ApiResponse<ChangeLogResult> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 20,
          version: '1.0.0',
          requestId: 'req-807',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getShopChangeLogs({
        limit: 100,
        offset: 0,
        shopId: 'shop-1',
        since: '2026-01-01T00:00:00Z',
        until: '2026-01-31T23:59:59Z',
      });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('v1/reports/shop-change-logs'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=100'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=0'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('shopId=shop-1'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('since=2026-01-01T00%3A00%3A00Z'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('until=2026-01-31T23%3A59%3A59Z'),
        expect.any(Object),
      );
    });

    it('should return shop change logs without filters', async () => {
      const mockData: ChangeLogResult = {
        count: 100,
        logs: [],
      };

      const mockResponse: ApiResponse<ChangeLogResult> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 25,
          version: '1.0.0',
          requestId: 'req-808',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getShopChangeLogs();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/reports/shop-change-logs',
        expect.any(Object),
      );
    });
  });

  describe('getItemChangeLogs', () => {
    it('should return item change logs', async () => {
      const mockData: ChangeLogResult = {
        count: 25,
        logs: [
          {
            id: 1,
            shopId: 'shop-1',
            shopName: 'Test Shop',
            changeType: 'added',
            itemName: 'minecraft:diamond',
            itemDisplayName: 'Diamond',
            itemHash: 'abc123',
            createdAt: '2026-01-20T00:00:00Z',
            updatedAt: '2026-01-20T00:00:00Z',
          },
        ],
      };

      const mockResponse: ApiResponse<ChangeLogResult> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 22,
          version: '1.0.0',
          requestId: 'req-809',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getItemChangeLogs({ limit: 50, shopId: 'shop-1' });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('v1/reports/item-change-logs'),
        expect.any(Object),
      );
    });
  });

  describe('getPriceChangeLogs', () => {
    it('should return price change logs', async () => {
      const mockData: ChangeLogResult = {
        count: 12,
        logs: [
          {
            id: 1,
            shopId: 'shop-1',
            shopName: 'Test Shop',
            itemName: 'minecraft:diamond',
            itemDisplayName: 'Diamond',
            itemHash: 'abc123',
            field: 'value',
            previousValue: '100',
            newValue: '150',
            createdAt: '2026-01-20T00:00:00Z',
            updatedAt: '2026-01-20T00:00:00Z',
          },
        ],
      };

      const mockResponse: ApiResponse<ChangeLogResult> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 18,
          version: '1.0.0',
          requestId: 'req-810',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.getPriceChangeLogs({
        since: '2026-01-15T00:00:00Z',
      });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('v1/reports/price-change-logs'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('since=2026-01-15T00%3A00%3A00Z'),
        expect.any(Object),
      );
    });
  });

  describe('get', () => {
    it('should return a specific report record', async () => {
      const mockRecord = {
        id: 'report-123',
        type: 'shop_change',
        data: { shopId: 'shop-1' },
        timestamp: '2026-01-20T00:00:00Z',
      };

      const mockResponse: ApiResponse<typeof mockRecord> = {
        success: true,
        data: mockRecord,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 8,
          version: '1.0.0',
          requestId: 'req-811',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await reports.get('report-123');

      expect(result).toEqual(mockRecord);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/reports/report-123',
        expect.any(Object),
      );
    });

    it('should throw error when report not found', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Report record not found',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-812',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
        headers: new Headers(),
      });

      await expect(reports.get('nonexistent')).rejects.toThrow('Report record not found');
    });
  });
});
