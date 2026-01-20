import { describe, it, expect } from 'vitest';
import { KrawletError } from '../error';

describe('KrawletError', () => {
  it('should create an error with all properties', () => {
    const error = new KrawletError('Shop not found', 'SHOP_NOT_FOUND', 404, 'req-123', {
      shopId: '999',
    });

    expect(error.message).toBe('Shop not found');
    expect(error.code).toBe('SHOP_NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.requestId).toBe('req-123');
    expect(error.details).toEqual({ shopId: '999' });
    expect(error.name).toBe('KrawletError');
  });

  it('should identify client errors correctly', () => {
    const error404 = new KrawletError('Not found', 'NOT_FOUND', 404);
    expect(error404.isClientError()).toBe(true);
    expect(error404.isServerError()).toBe(false);

    const error500 = new KrawletError('Internal error', 'INTERNAL_ERROR', 500);
    expect(error500.isClientError()).toBe(false);
    expect(error500.isServerError()).toBe(true);
  });

  it('should identify rate limit errors correctly', () => {
    const rateLimitError = new KrawletError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    expect(rateLimitError.isRateLimitError()).toBe(true);

    const normalError = new KrawletError('Bad request', 'BAD_REQUEST', 400);
    expect(normalError.isRateLimitError()).toBe(false);
  });
});
