// Main client
export { KrawletClient, type KrawletClientConfig } from './client';

// Error handling
export { KrawletError } from './error';

// Types
export type {
  // Core models
  Player,
  Shop,
  Item,
  Price,
  KnownAddress,
  // Change logs
  ShopChangeLog,
  ItemChangeLog,
  PriceChangeLog,
  // Sync data
  ShopSyncData,
  // API responses
  ApiResponse,
  ErrorResponse,
  ApiResponseMeta,
  RateLimit,
  // Health
  HealthResponse,
  DetailedHealthResponse,
  ServiceStatus,
  ServiceInfo,
  KromerServiceInfo,
  ChatboxServiceInfo,
  DiscordServiceInfo,
  HealthServices,
  HealthServicesDetailed,
  HealthChecks,
  // Storage
  StorageData,
  // Reports
  ReportRecords,
  ChangeLogResult,
  ChangeLogOptions,
  // API key management
  ApiKeyInfo,
  ApiKeyUsage,
  ApiKeyTier,
  RequestLog,
  RequestLogsResponse,
  QuickCodeGenerateResponse,
  QuickCodeRedeemResponse,
  // Enums and type aliases
  PlayerNotifications,
  KnownAddressType,
  ItemChangeType,
} from './types';

export { ErrorCode } from './types';

// Re-export resources for advanced usage
export { HealthResource, type ServiceName } from './resources/health';
export { PlayersResource } from './resources/players';
export { ShopsResource } from './resources/shops';
export { ItemsResource } from './resources/items';
export { AddressesResource } from './resources/addresses';
export { StorageResource } from './resources/storage';
export { ReportsResource } from './resources/reports';
export { ApiKeyResource } from './resources/apikey';
