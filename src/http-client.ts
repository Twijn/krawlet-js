import type { ApiResponse, ErrorResponse, RateLimit } from './types';
import { KrawletError } from './error';

/**
 * Configuration for the HTTP client
 */
export interface HttpClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
  /** Enable automatic retry on failure */
  enableRetry?: boolean;
  /** Maximum number of retries */
  maxRetries?: number;
  /** Initial retry delay in milliseconds */
  retryDelay?: number;
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request body */
  body?: unknown;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Override API key for this request */
  apiKey?: string;
}

/**
 * HTTP client for making requests to the Krawlet API
 */
export class HttpClient {
  private config: Required<HttpClientConfig>;
  private lastRateLimit?: RateLimit;

  constructor(config: HttpClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey || '',
      timeout: config.timeout || 30000,
      headers: config.headers || {},
      enableRetry: config.enableRetry !== false,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  /**
   * Get the last known rate limit information
   */
  getRateLimit(): RateLimit | undefined {
    return this.lastRateLimit;
  }

  /**
   * Make an HTTP request
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options.params);
    const headers = this.buildHeaders(options.headers, options.apiKey);

    let lastError: Error | undefined;
    let attempt = 0;
    const maxAttempts = this.config.enableRetry ? this.config.maxRetries + 1 : 1;

    while (attempt < maxAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Extract rate limit headers
        this.extractRateLimit(response);

        // Handle non-2xx responses
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        const data = (await response.json()) as ApiResponse<T>;
        return data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) except rate limits
        if (error instanceof KrawletError && error.isClientError() && !error.isRateLimitError()) {
          throw error;
        }

        // Check if we should retry
        if (attempt < maxAttempts - 1 && this.shouldRetry(error)) {
          const delay = this.calculateRetryDelay(attempt);
          await this.sleep(delay);
          attempt++;
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Build the full URL with query parameters
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(path, this.config.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Build request headers
   */
  private buildHeaders(
    customHeaders?: Record<string, string>,
    apiKey?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...customHeaders,
    };

    const key = apiKey || this.config.apiKey;
    if (key) {
      headers['Authorization'] = `Bearer ${key}`;
    }

    return headers;
  }

  /**
   * Extract rate limit information from response headers
   */
  private extractRateLimit(response: Response): void {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      this.lastRateLimit = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ErrorResponse;

    try {
      errorData = (await response.json()) as ErrorResponse;
    } catch {
      throw new KrawletError(
        `HTTP ${response.status}: ${response.statusText}`,
        'UNKNOWN_ERROR',
        response.status,
      );
    }

    throw new KrawletError(
      errorData.error.message,
      errorData.error.code,
      response.status,
      errorData.meta.requestId,
      errorData.error.details,
      errorData,
    );
  }

  /**
   * Determine if a request should be retried
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof KrawletError) {
      // Retry on server errors (5xx) or rate limits
      return error.isServerError() || error.isRateLimitError();
    }

    // Retry on network errors
    if (error instanceof Error) {
      return error.name === 'AbortError' || error.message.includes('fetch');
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    return this.config.retryDelay * Math.pow(2, attempt);
  }

  /**
   * Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
