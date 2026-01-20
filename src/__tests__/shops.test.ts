import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShopsResource } from '../resources/shops';
import { HttpClient } from '../http-client';
import type { ApiResponse, Shop, Item, ShopSyncData } from '../types';

describe('ShopsResource', () => {
  let client: HttpClient;
  let shops: ShopsResource;

  const mockItem: Item = {
    id: 'item-123',
    shopId: 'shop-1',
    itemName: 'minecraft:diamond',
    itemNbt: null,
    itemDisplayName: 'Diamond',
    itemDescription: 'A shiny diamond',
    shopBuysItem: false,
    noLimit: false,
    dynamicPrice: false,
    madeOnDemand: false,
    requiresInteraction: false,
    stock: 64,
    prices: [
      {
        id: 'price-1',
        value: 100,
        currency: 'KST',
        address: 'ks0d5iqb6p',
        requiredMeta: null,
      },
    ],
    addresses: ['ks0d5iqb6p'],
    createdDate: '2026-01-01T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
  };

  const mockShop: Shop = {
    id: 'shop-1',
    name: 'Diamond Shop',
    description: 'Best diamonds in town',
    owner: 'Twijn',
    computerId: 123,
    softwareName: 'ShopSync',
    softwareVersion: '1.0.0',
    locationCoordinates: '100 64 200',
    locationDescription: 'Spawn plaza',
    locationDimension: 'overworld',
    items: [mockItem],
    addresses: ['ks0d5iqb6p'],
    createdDate: '2026-01-01T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
  };

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
    });
    shops = new ShopsResource(client);
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all shops', async () => {
      const mockResponse: ApiResponse<Shop[]> = {
        success: true,
        data: [mockShop],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 25,
          version: '1.0.0',
          requestId: 'req-400',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await shops.getAll();

      expect(result).toEqual([mockShop]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/shops',
        expect.any(Object),
      );
    });
  });

  describe('get', () => {
    it('should return a specific shop', async () => {
      const mockResponse: ApiResponse<Shop> = {
        success: true,
        data: mockShop,
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 15,
          version: '1.0.0',
          requestId: 'req-401',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await shops.get('shop-1');

      expect(result).toEqual(mockShop);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/shops/shop-1',
        expect.any(Object),
      );
    });

    it('should throw error when shop not found', async () => {
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
          requestId: 'req-402',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
        headers: new Headers(),
      });

      await expect(shops.get('nonexistent')).rejects.toThrow('Shop not found');
    });
  });

  describe('getItems', () => {
    it('should return items for a shop', async () => {
      const mockResponse: ApiResponse<Item[]> = {
        success: true,
        data: [mockItem],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-403',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await shops.getItems('shop-1');

      expect(result).toEqual([mockItem]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/shops/shop-1/items',
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    it('should update a shop with authentication', async () => {
      const mockResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Shop updated successfully' },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 50,
          version: '1.0.0',
          requestId: 'req-404',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const shopData: ShopSyncData = {
        info: {
          name: 'Updated Shop',
          description: 'Updated description',
          owner: 'Twijn',
          computerID: 123,
          software: {
            name: 'ShopSync',
            version: '2.0.0',
          },
          location: {
            coordinates: [100, 64, 200],
            description: 'New location',
            dimension: 'overworld',
          },
        },
        items: [
          {
            item: {
              name: 'minecraft:diamond',
              displayName: 'Diamond',
            },
            stock: 64,
            prices: [
              {
                value: 100,
                currency: 'KST',
                address: 'ks0d5iqb6p',
              },
            ],
          },
        ],
      };

      await shops.update(shopData, 'shop_sync_token');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/shops',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer shop_sync_token',
          }),
          body: JSON.stringify(shopData),
        }),
      );
    });

    it('should throw error when unauthorized', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 5,
          version: '1.0.0',
          requestId: 'req-405',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
        headers: new Headers(),
      });

      const shopData: ShopSyncData = {
        info: {
          name: 'Test Shop',
          computerID: 123,
        },
        items: [],
      };

      await expect(shops.update(shopData, 'invalid_token')).rejects.toThrow(
        'Authentication required',
      );
    });
  });
});
