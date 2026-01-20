import { describe, it, expect } from 'vitest';
import type {
  ErrorCode,
  KnownAddressType,
  PlayerNotifications,
  ItemChangeType,
  Player,
  Shop,
  Item,
  Price,
  KnownAddress,
  ShopSyncData,
} from '../types';

describe('Types', () => {
  describe('Enums and Type Aliases', () => {
    it('should have correct ErrorCode values', () => {
      const codes: ErrorCode[] = [
        'BAD_REQUEST' as ErrorCode,
        'UNAUTHORIZED' as ErrorCode,
        'NOT_FOUND' as ErrorCode,
        'SHOP_NOT_FOUND' as ErrorCode,
        'INTERNAL_ERROR' as ErrorCode,
      ];
      expect(codes).toHaveLength(5);
    });

    it('should have correct KnownAddressType values', () => {
      const types: KnownAddressType[] = ['official', 'shop', 'gamble', 'service', 'company'];
      expect(types).toHaveLength(5);
    });

    it('should have correct PlayerNotifications values', () => {
      const notifications: PlayerNotifications[] = ['none', 'self', 'all'];
      expect(notifications).toHaveLength(3);
    });

    it('should have correct ItemChangeType values', () => {
      const changeTypes: ItemChangeType[] = ['added', 'removed'];
      expect(changeTypes).toHaveLength(2);
    });
  });

  describe('Interface Structures', () => {
    it('should create valid Player object', () => {
      const player: Player = {
        minecraftUUID: 'd98440d6-5117-4ac8-bd50-70b086101e3e',
        minecraftName: 'Twijn',
        kromerAddress: 'ks0d5iqb6p',
        notifications: 'all',
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-20T00:00:00Z',
        online: true,
      };

      expect(player.minecraftUUID).toMatch(/^[0-9a-f-]{36}$/);
      expect(player.kromerAddress).toHaveLength(10);
      expect(['none', 'self', 'all']).toContain(player.notifications);
    });

    it('should create valid Price object', () => {
      const price: Price = {
        id: 'price-123',
        value: 100.5,
        currency: 'KST',
        address: 'ks0d5iqb6p',
        requiredMeta: null,
      };

      expect(price.value).toBeGreaterThan(0);
      expect(price.currency).toBeTruthy();
    });

    it('should create valid Item object', () => {
      const item: Item = {
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
        stock: 64,
        prices: [],
        addresses: [],
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-20T00:00:00Z',
      };

      expect(item.itemName).toMatch(/^minecraft:/);
      expect(item.stock).toBeGreaterThanOrEqual(0);
    });

    it('should create valid Shop object', () => {
      const shop: Shop = {
        id: 'shop-1',
        name: 'Test Shop',
        description: 'A test shop',
        owner: 'Twijn',
        computerId: 123,
        softwareName: 'ShopSync',
        softwareVersion: '1.0.0',
        locationCoordinates: '100 64 200',
        locationDescription: 'Spawn',
        locationDimension: 'overworld',
        items: [],
        addresses: [],
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-20T00:00:00Z',
      };

      expect(shop.computerId).toBeGreaterThan(0);
      expect(shop.locationCoordinates).toMatch(/^-?\d+ -?\d+ -?\d+$/);
    });

    it('should create valid KnownAddress object', () => {
      const address: KnownAddress = {
        id: 'addr-1',
        type: 'official',
        address: 'khugepowr',
        imageSrc: 'https://example.com/image.png',
        name: 'Official Treasury',
        description: 'Main treasury',
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-20T00:00:00Z',
      };

      expect(['official', 'shop', 'gamble', 'service', 'company']).toContain(address.type);
      expect(address.address.length).toBeGreaterThan(0);
    });

    it('should create valid ShopSyncData object', () => {
      const shopData: ShopSyncData = {
        info: {
          name: 'New Shop',
          description: 'Description',
          owner: 'Twijn',
          computerID: 456,
          software: {
            name: 'ShopSync',
            version: '2.0.0',
          },
          location: {
            coordinates: [100, 64, 200],
            description: 'Near spawn',
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
              },
            ],
          },
        ],
      };

      expect(shopData.info.computerID).toBeGreaterThan(0);
      expect(shopData.info.location?.coordinates).toHaveLength(3);
      expect(shopData.items[0].prices[0].value).toBeGreaterThan(0);
    });
  });

  describe('Nullable Fields', () => {
    it('should allow null values for optional Player fields', () => {
      const player: Player = {
        minecraftUUID: 'd98440d6-5117-4ac8-bd50-70b086101e3e',
        minecraftName: 'Twijn',
        kromerAddress: 'ks0d5iqb6p',
        notifications: 'none',
        createdDate: null,
        updatedDate: null,
        online: false,
      };

      expect(player.createdDate).toBeNull();
      expect(player.updatedDate).toBeNull();
    });

    it('should allow null values for optional Shop fields', () => {
      const shop: Shop = {
        id: 'shop-1',
        name: 'Minimal Shop',
        description: null,
        owner: null,
        computerId: 1,
        softwareName: null,
        softwareVersion: null,
        locationCoordinates: null,
        locationDescription: null,
        locationDimension: null,
        items: [],
        addresses: [],
        createdDate: null,
        updatedDate: null,
      };

      expect(shop.description).toBeNull();
      expect(shop.owner).toBeNull();
    });
  });
});
