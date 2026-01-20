import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ItemsResource } from '../resources/items';
import { HttpClient } from '../http-client';
import type { ApiResponse, Item } from '../types';

describe('ItemsResource', () => {
  let client: HttpClient;
  let items: ItemsResource;

  const mockItem: Item = {
    id: 'item-123',
    shopId: 'shop-1',
    itemName: 'minecraft:diamond',
    itemNbt: null,
    itemDisplayName: 'Diamond',
    itemDescription: 'A precious gem',
    shopBuysItem: false,
    noLimit: false,
    dynamicPrice: false,
    madeOnDemand: false,
    requiresInteraction: false,
    stock: 128,
    prices: [
      {
        id: 'price-1',
        value: 50,
        currency: 'Kromer',
        address: 'ks0d5iqb6p',
        requiredMeta: null,
      },
    ],
    addresses: ['ks0d5iqb6p'],
    createdDate: '2026-01-01T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
  };

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
    });
    items = new ItemsResource(client);
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all items', async () => {
      const mockResponse: ApiResponse<Item[]> = {
        success: true,
        data: [mockItem],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 30,
          version: '1.0.0',
          requestId: 'req-500',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await items.getAll();

      expect(result).toEqual([mockItem]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/items',
        expect.any(Object),
      );
    });

    it('should return empty array when no items exist', async () => {
      const mockResponse: ApiResponse<Item[]> = {
        success: true,
        data: [],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-501',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await items.getAll();

      expect(result).toEqual([]);
    });
  });
});
