import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransfersResource } from '../resources/transfers';
import { HttpClient } from '../http-client';
import type {
  ApiResponse,
  PublicStorageTransferResponse,
  StorageSlotContents,
  Transfer,
  TransferCreateRequest,
  TransferTarget,
} from '../types';

describe('TransfersResource', () => {
  let client: HttpClient;
  let transfers: TransfersResource;

  const mockTransfer: Transfer = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    status: 'pending',
    error: null,
    fromUUID: 'd98440d6-5117-4ac8-bd50-70b086101e3e',
    fromUsername: 'Twijn',
    toUUID: 'a1234567-89ab-cdef-0123-456789abcdef',
    toUsername: 'Player2',
    itemName: 'minecraft:diamond',
    itemNbt: null,
    quantity: 64,
    quantityTransferred: 0,
    timestamp: '2026-04-12T10:30:00.000Z',
  };

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
      apiKey: 'kraw_test_key',
    });
    transfers = new TransfersResource(client);
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should list transfers', async () => {
      const mockResponse: ApiResponse<Transfer[]> = {
        success: true,
        data: [mockTransfer],
        meta: {
          timestamp: '2026-04-12T10:30:00.000Z',
          elapsed: 12,
          version: '1.0.0',
          requestId: 'req-1000',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await transfers.getAll();

      expect(result).toEqual([mockTransfer]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/transfers',
        expect.any(Object),
      );
    });
  });

  describe('create', () => {
    it('should create a transfer', async () => {
      const payload: TransferCreateRequest = {
        to: 'Player2',
        itemName: 'minecraft:diamond',
        quantity: 64,
      };

      const mockResponse: ApiResponse<Transfer> = {
        success: true,
        data: mockTransfer,
        meta: {
          timestamp: '2026-04-12T10:30:00.000Z',
          elapsed: 18,
          version: '1.0.0',
          requestId: 'req-1001',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await transfers.create(payload);

      expect(result).toEqual(mockTransfer);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/transfers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      );
    });
  });

  describe('get', () => {
    it('should get transfer by id', async () => {
      const mockResponse: ApiResponse<Transfer> = {
        success: true,
        data: mockTransfer,
        meta: {
          timestamp: '2026-04-12T10:30:00.000Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-1002',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await transfers.get(mockTransfer.id);

      expect(result).toEqual(mockTransfer);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.krawlet.cc/v1/transfers/${mockTransfer.id}`,
        expect.any(Object),
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a transfer', async () => {
      const cancelledTransfer: Transfer = {
        ...mockTransfer,
        status: 'cancelled',
        quantityTransferred: 32,
      };

      const mockResponse: ApiResponse<Transfer> = {
        success: true,
        data: cancelledTransfer,
        meta: {
          timestamp: '2026-04-12T10:30:00.000Z',
          elapsed: 11,
          version: '1.0.0',
          requestId: 'req-1003',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await transfers.cancel(mockTransfer.id);

      expect(result).toEqual(cancelledTransfer);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.krawlet.cc/v1/transfers/${mockTransfer.id}/cancel`,
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('getContents', () => {
    it('should get live ender storage contents', async () => {
      const contents: StorageSlotContents = {
        items: [
          { name: 'minecraft:diamond', count: 32 },
          {
            name: 'minecraft:enchanted_book',
            count: 1,
            nbt: '312db0d27bebe67a3084cbcff45c56cd',
          },
        ],
      };

      const mockResponse: ApiResponse<StorageSlotContents> = {
        success: true,
        data: contents,
        meta: {
          timestamp: '2026-04-12T10:30:00.000Z',
          elapsed: 14,
          version: '1.0.0',
          requestId: 'req-1004',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await transfers.getContents();

      expect(result).toEqual(contents);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/transfers/contents',
        expect.any(Object),
      );
    });
  });

  describe('getTargets', () => {
    it('should list transfer targets', async () => {
      const targets: TransferTarget[] = [
        {
          id: 'entity-1',
          name: 'Player2',
          type: 'player',
          links: [
            { type: 'minecraft_uuid', value: 'a1234567-89ab-cdef-0123-456789abcdef' },
            { type: 'minecraft_name', value: 'Player2' },
          ],
        },
      ];

      const mockResponse: ApiResponse<TransferTarget[]> = {
        success: true,
        data: targets,
        meta: {
          timestamp: '2026-04-12T10:30:00.000Z',
          elapsed: 9,
          version: '1.0.0',
          requestId: 'req-1005',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await transfers.getTargets();

      expect(result).toEqual(targets);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/transfers/targets',
        expect.any(Object),
      );
    });
  });

  describe('requestPublicStorage', () => {
    it('should request public storage transfer', async () => {
      const mockData: PublicStorageTransferResponse = {
        transfer: {
          ...mockTransfer,
          status: 'in_progress',
        },
        sourceEntity: {
          id: 'source-1',
          name: 'Public Diamonds',
          type: 'public_storage',
          alias: 'diamonds',
        },
      };

      const payload = {
        itemName: 'minecraft:diamond',
        quantity: 64,
        source: 'diamonds',
      };

      const mockResponse: ApiResponse<PublicStorageTransferResponse> = {
        success: true,
        data: mockData,
        meta: {
          timestamp: '2026-04-12T10:30:00.000Z',
          elapsed: 22,
          version: '1.0.0',
          requestId: 'req-1006',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await transfers.requestPublicStorage(payload);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/requests/public-storage',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      );
    });
  });
});
