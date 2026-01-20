import type { HttpClient } from '../http-client';
import type { HealthResponse, DetailedHealthResponse } from '../types';

/**
 * Health resource for checking API status
 */
export class HealthResource {
  constructor(private client: HttpClient) {}

  /**
   * Basic health check to verify API is operational
   * @returns Health status information
   */
  async check(): Promise<HealthResponse> {
    const response = await this.client.request<HealthResponse>('/v1/health');
    return response.data;
  }

  /**
   * Detailed health check with system information
   * @returns Detailed health status with system metrics
   */
  async detailed(): Promise<DetailedHealthResponse> {
    const response = await this.client.request<DetailedHealthResponse>('/v1/health/detailed');
    return response.data;
  }
}
