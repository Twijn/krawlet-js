import type { HttpClient } from '../http-client';
import type {
  HealthResponse,
  DetailedHealthResponse,
  ServiceStatus,
  ServiceInfo,
  KromerServiceInfo,
  ChatboxServiceInfo,
  DiscordServiceInfo,
} from '../types';

/** Service names available for status checks */
export type ServiceName = 'kromerWs' | 'chatbox' | 'discord';

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

  /**
   * Get the status of a specific service
   * @param service - The service to check ('kromerWs', 'chatbox', or 'discord')
   * @param useDetailed - Whether to fetch detailed health info (default: false)
   * @returns The service status information
   */
  async getServiceStatus<T extends ServiceName>(
    service: T,
    useDetailed?: false,
  ): Promise<ServiceInfo>;
  async getServiceStatus<T extends ServiceName>(
    service: T,
    useDetailed: true,
  ): Promise<
    T extends 'kromerWs'
      ? KromerServiceInfo
      : T extends 'chatbox'
        ? ChatboxServiceInfo
        : DiscordServiceInfo
  >;
  async getServiceStatus<T extends ServiceName>(
    service: T,
    useDetailed: boolean = false,
  ): Promise<ServiceInfo | KromerServiceInfo | ChatboxServiceInfo | DiscordServiceInfo> {
    if (useDetailed) {
      const health = await this.detailed();
      return health.services[service];
    }
    const health = await this.check();
    return health.services[service];
  }

  /**
   * Check if all services are connected
   * @returns true if all services have 'connected' status
   */
  async areAllServicesConnected(): Promise<boolean> {
    const health = await this.check();
    const services = health.services;
    return (
      services.kromerWs.status === 'connected' &&
      services.chatbox.status === 'connected' &&
      services.discord.status === 'connected'
    );
  }

  /**
   * Get the connection status of all services as a simple object
   * @returns Object mapping service names to their connection status
   */
  async getServicesStatus(): Promise<Record<ServiceName, ServiceStatus>> {
    const health = await this.check();
    return {
      kromerWs: health.services.kromerWs.status,
      chatbox: health.services.chatbox.status,
      discord: health.services.discord.status,
    };
  }
}
