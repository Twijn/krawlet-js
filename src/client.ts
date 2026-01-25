import { HttpClient, type HttpClientConfig } from './http-client';
import { HealthResource } from './resources/health';
import { PlayersResource } from './resources/players';
import { ShopsResource } from './resources/shops';
import { ItemsResource } from './resources/items';
import { AddressesResource } from './resources/addresses';
import { StorageResource } from './resources/storage';
import { ReportsResource } from './resources/reports';
import { ApiKeyResource } from './resources/apikey';
import type { RateLimit } from './types';

/**
 * Configuration options for the Krawlet API client
 */
export interface KrawletClientConfig {
  /** API base URL (default: production URL) */
  baseUrl?: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
  /** Enable automatic retry on failure (default: true) */
  enableRetry?: boolean;
  /** Maximum number of retries (default: 3) */
  maxRetries?: number;
  /** Initial retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Main client for interacting with the Krawlet API
 *
 * @example
 * ```typescript
 * const client = new KrawletClient({
 *   apiKey: 'kraw_your_key_here',
 * });
 *
 * // Get all shops
 * const shops = await client.shops.getAll();
 *
 * // Find player by address
 * const players = await client.players.getByAddresses(['ks0d5iqb6p']);
 * ```
 */
export class KrawletClient {
  private httpClient: HttpClient;

  /** Health check endpoints */
  public readonly health: HealthResource;
  /** Player data endpoints */
  public readonly players: PlayersResource;
  /** Shop data endpoints */
  public readonly shops: ShopsResource;
  /** Item listing endpoints */
  public readonly items: ItemsResource;
  /** Known address endpoints */
  public readonly addresses: AddressesResource;
  /** Ender storage endpoints */
  public readonly storage: StorageResource;
  /** Report and statistics endpoints */
  public readonly reports: ReportsResource;
  /** API key management endpoints */
  public readonly apiKey: ApiKeyResource;

  /**
   * Create a new Krawlet API client
   * @param config - Client configuration options
   */
  constructor(config: KrawletClientConfig = {}) {
    const httpConfig: HttpClientConfig = {
      baseUrl: config.baseUrl || 'https://api.krawlet.cc',
      apiKey: config.apiKey,
      timeout: config.timeout,
      headers: config.headers,
      enableRetry: config.enableRetry,
      maxRetries: config.maxRetries,
      retryDelay: config.retryDelay,
    };

    this.httpClient = new HttpClient(httpConfig);

    // Initialize resource endpoints
    this.health = new HealthResource(this.httpClient);
    this.players = new PlayersResource(this.httpClient);
    this.shops = new ShopsResource(this.httpClient);
    this.items = new ItemsResource(this.httpClient);
    this.addresses = new AddressesResource(this.httpClient);
    this.storage = new StorageResource(this.httpClient);
    this.reports = new ReportsResource(this.httpClient);
    this.apiKey = new ApiKeyResource(this.httpClient);
  }

  /**
   * Get the last known rate limit information
   * @returns Rate limit data or undefined if no requests have been made
   */
  getRateLimit(): RateLimit | undefined {
    return this.httpClient.getRateLimit();
  }
}
