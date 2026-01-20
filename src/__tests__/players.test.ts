import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayersResource } from '../resources/players';
import { HttpClient } from '../http-client';
import type { ApiResponse, Player } from '../types';

describe('PlayersResource', () => {
  let client: HttpClient;
  let players: PlayersResource;

  const mockPlayer: Player = {
    minecraftUUID: 'd98440d6-5117-4ac8-bd50-70b086101e3e',
    minecraftName: 'Twijn',
    kromerAddress: 'ks0d5iqb6p',
    notifications: 'all',
    createdDate: '2026-01-01T00:00:00Z',
    updatedDate: '2026-01-20T00:00:00Z',
    online: true,
  };

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'https://api.krawlet.cc',
    });
    players = new PlayersResource(client);
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all players', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [mockPlayer],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 15,
          version: '1.0.0',
          requestId: 'req-300',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await players.getAll();

      expect(result).toEqual([mockPlayer]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players',
        expect.any(Object),
      );
    });
  });

  describe('getByAddresses', () => {
    it('should return players by addresses', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [mockPlayer],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-301',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await players.getByAddresses(['ks0d5iqb6p']);

      expect(result).toEqual([mockPlayer]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players?addresses=ks0d5iqb6p',
        expect.any(Object),
      );
    });

    it('should handle multiple addresses', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [mockPlayer],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-302',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      await players.getByAddresses(['ks0d5iqb6p', 'k12345678']);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players?addresses=ks0d5iqb6p%2Ck12345678',
        expect.any(Object),
      );
    });
  });

  describe('getByNames', () => {
    it('should return players by names', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [mockPlayer],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-303',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await players.getByNames(['Twijn']);

      expect(result).toEqual([mockPlayer]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players?names=Twijn',
        expect.any(Object),
      );
    });

    it('should handle multiple names', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [mockPlayer],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-304',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      await players.getByNames(['Twijn', 'Player2']);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players?names=Twijn%2CPlayer2',
        expect.any(Object),
      );
    });
  });

  describe('getByUuids', () => {
    it('should return players by UUIDs', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [mockPlayer],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-305',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      const result = await players.getByUuids(['d98440d6-5117-4ac8-bd50-70b086101e3e']);

      expect(result).toEqual([mockPlayer]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.krawlet.cc/v1/players?uuids=d98440d6-5117-4ac8-bd50-70b086101e3e',
        expect.any(Object),
      );
    });

    it('should handle multiple UUIDs', async () => {
      const mockResponse: ApiResponse<Player[]> = {
        success: true,
        data: [mockPlayer],
        meta: {
          timestamp: '2026-01-20T00:00:00Z',
          elapsed: 10,
          version: '1.0.0',
          requestId: 'req-306',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      await players.getByUuids([
        'd98440d6-5117-4ac8-bd50-70b086101e3e',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      ]);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('uuids=d98440d6-5117-4ac8-bd50-70b086101e3e'),
        expect.any(Object),
      );
    });
  });
});
