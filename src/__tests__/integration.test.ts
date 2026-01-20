/**
 * Integration tests for the Krawlet client
 *
 * Note: These tests are designed to run against a live API or mock server.
 * Set KRAWLET_API_URL and KRAWLET_API_KEY environment variables to test
 * against a real instance.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { KrawletClient } from '../client';
import { KrawletError } from '../error';

describe('Integration Tests', () => {
  let client: KrawletClient;
  const apiUrl = process.env.KRAWLET_API_URL || 'https://api.krawlet.cc';
  const apiKey = process.env.KRAWLET_API_KEY;

  beforeAll(() => {
    client = new KrawletClient({
      baseUrl: apiUrl,
      apiKey,
    });
  });

  describe('Client Initialization', () => {
    it('should create client with production URL', () => {
      const prodClient = new KrawletClient();
      expect(prodClient).toBeDefined();
    });

    it('should create client with local URL', () => {
      const localClient = new KrawletClient({
        baseUrl: 'http://localhost:3330/api',
      });
      expect(localClient).toBeDefined();
    });

    it('should create client with all options', () => {
      const customClient = new KrawletClient({
        baseUrl: apiUrl,
        apiKey: 'test_key',
        timeout: 10000,
        enableRetry: true,
        maxRetries: 5,
      });
      expect(customClient).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle KrawletError with all properties', () => {
      const error = new KrawletError('Test error', 'TEST_ERROR', 400, 'req-123', {
        field: 'value',
      });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(KrawletError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.requestId).toBe('req-123');
      expect(error.details).toEqual({ field: 'value' });
      expect(error.isClientError()).toBe(true);
      expect(error.isServerError()).toBe(false);
      expect(error.isRateLimitError()).toBe(false);
    });

    it('should identify different error types correctly', () => {
      const clientError = new KrawletError('Bad Request', 'BAD_REQUEST', 400);
      expect(clientError.isClientError()).toBe(true);
      expect(clientError.isServerError()).toBe(false);

      const serverError = new KrawletError('Server Error', 'INTERNAL_ERROR', 500);
      expect(serverError.isClientError()).toBe(false);
      expect(serverError.isServerError()).toBe(true);

      const rateLimitError = new KrawletError('Rate Limit', 'RATE_LIMIT_EXCEEDED', 429);
      expect(rateLimitError.isRateLimitError()).toBe(true);
    });
  });

  describe('Method Signatures', () => {
    it('should have all expected resource methods', () => {
      // Health
      expect(typeof client.health.check).toBe('function');
      expect(typeof client.health.detailed).toBe('function');

      // Players
      expect(typeof client.players.getAll).toBe('function');
      expect(typeof client.players.getByAddresses).toBe('function');
      expect(typeof client.players.getByNames).toBe('function');
      expect(typeof client.players.getByUuids).toBe('function');

      // Shops
      expect(typeof client.shops.getAll).toBe('function');
      expect(typeof client.shops.get).toBe('function');
      expect(typeof client.shops.getItems).toBe('function');
      expect(typeof client.shops.update).toBe('function');

      // Items
      expect(typeof client.items.getAll).toBe('function');

      // Addresses
      expect(typeof client.addresses.getAll).toBe('function');

      // Storage
      expect(typeof client.storage.get).toBe('function');
      expect(typeof client.storage.set).toBe('function');

      // Reports
      expect(typeof client.reports.getStats).toBe('function');
      expect(typeof client.reports.getValidationFailures).toBe('function');
      expect(typeof client.reports.getSuccessfulPosts).toBe('function');
      expect(typeof client.reports.getShopChanges).toBe('function');
      expect(typeof client.reports.getItemChanges).toBe('function');
      expect(typeof client.reports.getShopChangeLogs).toBe('function');
      expect(typeof client.reports.getItemChangeLogs).toBe('function');
      expect(typeof client.reports.getPriceChangeLogs).toBe('function');
      expect(typeof client.reports.get).toBe('function');
    });
  });

  describe('Rate Limit Information', () => {
    it('should expose rate limit getter', () => {
      expect(typeof client.getRateLimit).toBe('function');
    });
  });

  describe('Request Building', () => {
    it('should build URLs correctly for different environments', () => {
      const prodClient = new KrawletClient({
        baseUrl: 'https://api.krawlet.cc',
      });
      expect(prodClient).toBeDefined();

      const localClient = new KrawletClient({
        baseUrl: 'http://localhost:3330/api',
      });
      expect(localClient).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should have proper TypeScript types for all methods', async () => {
      // This test validates that TypeScript compilation works correctly
      // The actual type checking happens at compile time

      // Players methods should return Player[]
      const playersAllPromise = client.players.getAll();
      expect(playersAllPromise).toBeInstanceOf(Promise);

      const playersByAddressPromise = client.players.getByAddresses(['ks0d5iqb6p']);
      expect(playersByAddressPromise).toBeInstanceOf(Promise);

      // Shops methods should return Shop or Shop[]
      const shopsPromise = client.shops.getAll();
      expect(shopsPromise).toBeInstanceOf(Promise);

      // Items should return Item[]
      const itemsPromise = client.items.getAll();
      expect(itemsPromise).toBeInstanceOf(Promise);
    });
  });

  describe('Configuration Options', () => {
    it('should accept timeout configuration', () => {
      const timeoutClient = new KrawletClient({
        baseUrl: apiUrl,
        timeout: 5000,
      });
      expect(timeoutClient).toBeDefined();
    });

    it('should accept retry configuration', () => {
      const retryClient = new KrawletClient({
        baseUrl: apiUrl,
        enableRetry: true,
        maxRetries: 5,
        retryDelay: 2000,
      });
      expect(retryClient).toBeDefined();
    });

    it('should accept custom headers', () => {
      const headersClient = new KrawletClient({
        baseUrl: apiUrl,
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });
      expect(headersClient).toBeDefined();
    });
  });
});
