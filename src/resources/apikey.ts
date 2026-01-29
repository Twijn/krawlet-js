import type { HttpClient } from '../http-client';
import type {
  ApiKeyInfo,
  ApiKeyUsage,
  RequestLogsResponse,
  QuickCodeGenerateResponse,
  QuickCodeRedeemResponse,
} from '../types';

/**
 * Options for getting API key info
 */
export interface GetApiKeyInfoOptions {
  /** Include detailed usage statistics (default: true) */
  usage?: boolean;
}

/**
 * Options for getting API key logs
 */
export interface GetApiKeyLogsOptions {
  /** Maximum number of logs to return (1-100, default: 50) */
  limit?: number;
}

/**
 * API key management resource for retrieving information about the authenticated API key
 *
 * @remarks
 * All methods in this resource require authentication with a valid API key.
 *
 * @example
 * ```typescript
 * const client = new KrawletClient({ apiKey: 'kraw_your_key_here' });
 *
 * // Get API key info with usage stats
 * const info = await client.apiKey.getInfo();
 * console.log(`Tier: ${info.tier}, Rate limit: ${info.rateLimit}/hour`);
 *
 * // Get detailed usage statistics
 * const usage = await client.apiKey.getUsage();
 * console.log(`Requests last 24h: ${usage.last24h}`);
 *
 * // Get recent request logs
 * const logs = await client.apiKey.getLogs({ limit: 20 });
 * console.log(`Last ${logs.count} requests:`, logs.logs);
 * ```
 */
export class ApiKeyResource {
  constructor(private client: HttpClient) {}

  /**
   * Get information about the authenticated API key
   *
   * @param options - Optional parameters
   * @param options.usage - Include detailed usage statistics (default: true)
   * @returns API key information with optional usage statistics
   * @throws {KrawletError} If not authenticated (401)
   *
   * @example
   * ```typescript
   * // Get full info with usage stats
   * const info = await client.apiKey.getInfo();
   *
   * // Get basic info without usage stats
   * const basicInfo = await client.apiKey.getInfo({ usage: false });
   * ```
   */
  async getInfo(options?: GetApiKeyInfoOptions): Promise<ApiKeyInfo> {
    const params: Record<string, string> = {};

    if (options?.usage !== undefined) {
      params.usage = String(options.usage);
    }

    const response = await this.client.request<ApiKeyInfo>('/v1/apikey', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  }

  /**
   * Get detailed usage statistics for the authenticated API key
   *
   * @returns Detailed usage statistics including request counts and top endpoints
   * @throws {KrawletError} If not authenticated (401)
   *
   * @example
   * ```typescript
   * const usage = await client.apiKey.getUsage();
   * console.log(`Total requests: ${usage.totalRequests}`);
   * console.log(`Last 24h: ${usage.last24h}`);
   * console.log(`Blocked: ${usage.blockedRequests}`);
   * console.log('Top endpoints:', usage.topEndpoints);
   * ```
   */
  async getUsage(): Promise<ApiKeyUsage> {
    const response = await this.client.request<ApiKeyUsage>('/v1/apikey/usage');
    return response.data;
  }

  /**
   * Get recent request logs for the authenticated API key
   *
   * @param options - Optional parameters
   * @param options.limit - Maximum number of logs to return (1-100, default: 50)
   * @returns Request logs with count
   * @throws {KrawletError} If not authenticated (401)
   *
   * @example
   * ```typescript
   * // Get default number of logs (50)
   * const logs = await client.apiKey.getLogs();
   *
   * // Get last 10 requests
   * const recentLogs = await client.apiKey.getLogs({ limit: 10 });
   *
   * for (const log of recentLogs.logs) {
   *   console.log(`${log.method} ${log.path} - ${log.responseStatus} (${log.responseTimeMs}ms)`);
   * }
   * ```
   */
  async getLogs(options?: GetApiKeyLogsOptions): Promise<RequestLogsResponse> {
    const params: Record<string, string> = {};

    if (options?.limit !== undefined) {
      params.limit = String(options.limit);
    }

    const response = await this.client.request<RequestLogsResponse>('/v1/apikey/logs', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  }

  /**
   * Generate a quick code for retrieving the API key on another device
   *
   * @remarks
   * Quick codes are 6-digit codes that expire in 15 minutes.
   * Redeeming a quick code will regenerate the API key.
   *
   * @returns Quick code information including the code and expiration
   * @throws {KrawletError} If not authenticated (401)
   *
   * @example
   * ```typescript
   * const quickCode = await client.apiKey.generateQuickCode();
   * console.log(`Your quick code is: ${quickCode.quickCode}`);
   * console.log(`Expires at: ${quickCode.expiresAt}`);
   * // Share this code to retrieve your API key on another device
   * ```
   */
  async generateQuickCode(): Promise<QuickCodeGenerateResponse> {
    const response = await this.client.request<QuickCodeGenerateResponse>(
      '/v1/apikey/quickcode/generate',
      { method: 'POST' },
    );
    return response.data;
  }

  /**
   * Redeem a quick code to get a new API key
   *
   * @remarks
   * This endpoint does not require authentication.
   * Redeeming a quick code will regenerate the API key - save the returned key securely!
   *
   * @param code - The 6-digit quick code to redeem
   * @returns The new API key and related information
   * @throws {KrawletError} If the code is invalid or expired (400/404)
   *
   * @example
   * ```typescript
   * // Create a client without an API key for redeeming
   * const client = new KrawletClient({});
   *
   * const result = await client.apiKey.redeemQuickCode('003721');
   * console.log(`New API key: ${result.apiKey}`);
   * console.log(`Warning: ${result.warning}`);
   * // Save this API key securely!
   * ```
   */
  async redeemQuickCode(code: string): Promise<QuickCodeRedeemResponse> {
    const response = await this.client.request<QuickCodeRedeemResponse>(
      '/v1/apikey/quickcode/redeem',
      {
        method: 'POST',
        body: { code },
      },
    );
    return response.data;
  }
}
