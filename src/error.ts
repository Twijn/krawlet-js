import type { ErrorResponse } from './types';

/**
 * Custom error class for Krawlet API errors
 */
export class KrawletError extends Error {
  /** Error code from API */
  public readonly code: string;
  /** HTTP status code */
  public readonly statusCode: number;
  /** Request ID for debugging */
  public readonly requestId?: string;
  /** Additional error details */
  public readonly details?: unknown;
  /** Original error response */
  public readonly response?: ErrorResponse;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    requestId?: string,
    details?: unknown,
    response?: ErrorResponse,
  ) {
    super(message);
    this.name = 'KrawletError';
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.details = details;
    this.response = response;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KrawletError);
    }
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if this is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429 || this.code === 'RATE_LIMIT_EXCEEDED';
  }
}
