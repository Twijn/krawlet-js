import { describe, it, expect, beforeEach } from 'vitest';
import { KrawletClient } from '../client';

describe('KrawletClient', () => {
  let client: KrawletClient;

  beforeEach(() => {
    client = new KrawletClient({
      baseUrl: 'https://api.krawlet.cc',
    });
  });

  it('should create a client with default configuration', () => {
    expect(client).toBeDefined();
    expect(client.health).toBeDefined();
    expect(client.players).toBeDefined();
    expect(client.shops).toBeDefined();
    expect(client.items).toBeDefined();
    expect(client.addresses).toBeDefined();
    expect(client.storage).toBeDefined();
    expect(client.reports).toBeDefined();
  });

  it('should create a client with custom configuration', () => {
    const customClient = new KrawletClient({
      baseUrl: 'http://localhost:3330/api',
      apiKey: 'test_key',
      timeout: 5000,
    });

    expect(customClient).toBeDefined();
  });

  it('should have resource methods available', () => {
    expect(typeof client.health.check).toBe('function');
    expect(typeof client.players.getAll).toBe('function');
    expect(typeof client.shops.getAll).toBe('function');
    expect(typeof client.items.getAll).toBe('function');
    expect(typeof client.addresses.getAll).toBe('function');
    expect(typeof client.storage.get).toBe('function');
    expect(typeof client.reports.getStats).toBe('function');
  });
});
