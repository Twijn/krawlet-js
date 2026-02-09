/**
 * Error codes returned by the Krawlet API
 */
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Resource-specific errors
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  SHOP_NOT_FOUND = 'SHOP_NOT_FOUND',
  TURTLE_NOT_FOUND = 'TURTLE_NOT_FOUND',
  INVALID_API_KEY = 'INVALID_API_KEY',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  HEALTH_CHECK_FAILED = 'HEALTH_CHECK_FAILED',
}

/**
 * Known address types
 */
export type KnownAddressType = 'official' | 'shop' | 'gamble' | 'service' | 'company';

/**
 * Player notification settings
 */
export type PlayerNotifications = 'none' | 'self' | 'all';

/**
 * Item change log type
 */
export type ItemChangeType = 'added' | 'removed';

/**
 * Shop source type indicating how the shop was added
 * - 'modem': Shop was added via direct modem connection (default)
 * - 'radio_tower': Shop was added via CC Radio Tower (remote/relay)
 */
export type ShopSourceType = 'modem' | 'radio_tower';

/**
 * Price information for an item
 */
export interface Price {
  /** UUID */
  id: string;
  /** Price amount (can be decimal) */
  value: number;
  /** Currency name (e.g., "KST", "Kromer") */
  currency: string;
  /** Kromer address for payment */
  address: string | null;
  /** Required metadata for transaction */
  requiredMeta: string | null;
}

/**
 * Item listing in a shop
 */
export interface Item {
  /** UUID */
  id: string;
  /** Shop ID */
  shopId: string;
  /** Minecraft item ID (e.g., "minecraft:diamond") */
  itemName: string;
  /** NBT data if present */
  itemNbt: string | null;
  /** Human-readable display name */
  itemDisplayName: string | null;
  /** Item description */
  itemDescription: string | null;
  /** true = shop buys FROM players */
  shopBuysItem: boolean | null;
  /** No limit on quantity */
  noLimit: boolean | null;
  /** Dynamic pricing enabled */
  dynamicPrice: boolean;
  /** Made on demand */
  madeOnDemand: boolean;
  /** Requires player interaction */
  requiresInteraction: boolean;
  /** Current stock */
  stock: number;
  /** Array of prices */
  prices: Price[];
  /** Unique addresses from prices */
  addresses: string[];
  /** ISO 8601 datetime */
  createdDate: string | null;
  /** ISO 8601 datetime */
  updatedDate: string | null;
}

/**
 * Shop information
 */
export interface Shop {
  /** Shop ID (computer ID as string) */
  id: string;
  /** Shop name */
  name: string;
  /** Shop description */
  description: string | null;
  /** Shop owner */
  owner: string | null;
  /** Computer ID */
  computerId: number;
  /** Software name */
  softwareName: string | null;
  /** Software version */
  softwareVersion: string | null;
  /** How the shop was added (modem=direct connection, radio_tower=CC Radio Tower) */
  sourceType: ShopSourceType;
  /** Space-separated coordinates: "123 64 -456" */
  locationCoordinates: string | null;
  /** Location description */
  locationDescription: string | null;
  /** Dimension name */
  locationDimension: string | null;
  /** Array of listings */
  items: Item[];
  /** Unique Kromer addresses from item prices */
  addresses: string[];
  /** ISO 8601 datetime */
  createdDate: string | null;
  /** ISO 8601 datetime */
  updatedDate: string | null;
}

/**
 * Player information
 */
export interface Player {
  /** UUID format: "d98440d6-5117-4ac8-bd50-70b086101e3e" */
  minecraftUUID: string;
  /** Player's Minecraft username */
  minecraftName: string;
  /** 10-character Kromer address (e.g., "ks0d5iqb6p") */
  kromerAddress: string;
  /** Notification settings */
  notifications: PlayerNotifications;
  /** ISO 8601 datetime */
  createdDate: string | null;
  /** ISO 8601 datetime */
  updatedDate: string | null;
  /** Whether player is currently online */
  online: boolean;
}

/**
 * Known Kromer address
 */
export interface KnownAddress {
  /** Address ID */
  id: string;
  /** Address type */
  type: KnownAddressType;
  /** 10-character Kromer address */
  address: string;
  /** Optional image URL */
  imageSrc: string | null;
  /** Address name */
  name: string;
  /** Address description */
  description: string;
  /** ISO 8601 datetime */
  createdDate: string | null;
  /** ISO 8601 datetime */
  updatedDate: string | null;
}

/**
 * Shop change log entry
 */
export interface ShopChangeLog {
  id: number;
  shopId: string;
  shopName: string;
  /** Field that changed */
  field: string;
  previousValue: string | null;
  newValue: string | null;
  isNewShop: boolean;
  /** ISO 8601 datetime */
  createdAt: string;
  /** ISO 8601 datetime */
  updatedAt: string;
}

/**
 * Item change log entry
 */
export interface ItemChangeLog {
  id: number;
  shopId: string;
  shopName: string;
  changeType: ItemChangeType;
  itemName: string;
  itemDisplayName: string;
  itemHash: string;
  /** ISO 8601 datetime */
  createdAt: string;
  /** ISO 8601 datetime */
  updatedAt: string;
}

/**
 * Price change log entry
 */
export interface PriceChangeLog {
  id: number;
  shopId: string;
  shopName: string;
  itemName: string;
  itemDisplayName: string;
  itemHash: string;
  field: string;
  previousValue: string | null;
  newValue: string | null;
  /** ISO 8601 datetime */
  createdAt: string;
  /** ISO 8601 datetime */
  updatedAt: string;
}

/**
 * Data structure for creating/updating shops
 */
export interface ShopSyncData {
  /** How the shop was added (defaults to 'modem' if not specified) */
  sourceType?: ShopSourceType;
  info: {
    name: string;
    description?: string;
    owner?: string;
    computerID: number;
    software?: {
      name: string;
      version: string;
    };
    location?: {
      coordinates: [number, number, number];
      description?: string;
      dimension?: string;
    };
  };
  items: Array<{
    item: {
      /** Minecraft item ID */
      name: string;
      nbt?: string;
      displayName?: string;
      description?: string;
    };
    shopBuysItem?: boolean;
    noLimit?: boolean;
    dynamicPrice?: boolean;
    madeOnDemand?: boolean;
    requiresInteraction?: boolean;
    stock?: number;
    prices: Array<{
      value: number;
      currency: string;
      address?: string;
      requiredMeta?: string;
    }>;
  }>;
}

/**
 * API key tier
 * - `free` - Free tier user API keys
 * - `premium` - Premium tier user API keys
 * - `shopsync` - ShopSync service API keys
 * - `enderstorage` - EnderStorage service API keys
 * - `internal` - Internal service API keys
 */
export type ApiKeyTier = 'free' | 'premium' | 'shopsync' | 'enderstorage' | 'internal';

/**
 * API key usage statistics
 */
export interface ApiKeyUsage {
  /** Total requests made with this key */
  totalRequests: number;
  /** Requests in the last 24 hours */
  last24h: number;
  /** Requests in the last 7 days */
  last7d: number;
  /** Requests in the last 30 days */
  last30d: number;
  /** Number of blocked requests */
  blockedRequests: number;
  /** Average response time in milliseconds */
  avgResponseTimeMs: number | null;
  /** Most frequently accessed endpoints */
  topEndpoints: Array<{ path: string; count: number }>;
}

/**
 * API key information
 */
export interface ApiKeyInfo {
  /** API key ID */
  id: string;
  /** Key name/label */
  name: string;
  /** Contact email */
  email: string | null;
  /** API key tier */
  tier: ApiKeyTier;
  /** Rate limit (requests per hour) */
  rateLimit: number;
  /** Whether the key is active */
  isActive: boolean;
  /** Total request count */
  requestCount: number;
  /** ISO 8601 datetime of last use */
  lastUsedAt: string | null;
  /** ISO 8601 datetime of creation */
  createdAt: string;
  /** Usage statistics (only present if requested) */
  usage?: ApiKeyUsage;
}

/**
 * Request log entry
 */
export interface RequestLog {
  /** Unique request identifier */
  requestId: string;
  /** ISO 8601 datetime */
  timestamp: string;
  /** HTTP method */
  method: string;
  /** Request path */
  path: string;
  /** Response status code */
  responseStatus: number | null;
  /** Response time in milliseconds */
  responseTimeMs: number | null;
  /** Whether the request was blocked */
  wasBlocked: boolean;
  /** Reason for blocking (if blocked) */
  blockReason: string | null;
}

/**
 * Request logs response
 */
export interface RequestLogsResponse {
  /** Number of logs returned */
  count: number;
  /** Array of request logs */
  logs: RequestLog[];
}

/**
 * Response from generating a quick code
 */
export interface QuickCodeGenerateResponse {
  /** 6-digit quick code */
  quickCode: string;
  /** ISO 8601 datetime when the code expires */
  expiresAt: string;
  /** Human-readable expiration duration */
  expiresIn: string;
  /** Informational message */
  message: string;
}

/**
 * Response from redeeming a quick code
 */
export interface QuickCodeRedeemResponse {
  /** Success message */
  message: string;
  /** The new API key (save this - it won't be shown again!) */
  apiKey: string;
  /** Name/label of the API key */
  name: string;
  /** API key tier */
  tier: ApiKeyTier;
  /** Rate limit (requests per hour) */
  rateLimit: number;
  /** Warning about saving the key securely */
  warning: string;
}

/**
 * Rate limit information
 */
export interface RateLimit {
  /** Max requests per hour */
  limit: number;
  /** Remaining requests */
  remaining: number;
  /** Unix timestamp for reset */
  reset: number;
}

/**
 * API response metadata
 */
export interface ApiResponseMeta {
  /** ISO 8601 datetime */
  timestamp: string;
  /** Request processing time in ms */
  elapsed: number;
  /** API version (e.g., "1.0.0") */
  version: string;
  /** Unique request identifier (UUID) */
  requestId: string;
  /** Rate limit information */
  rateLimit?: RateLimit;
}

/**
 * Successful API response wrapper
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  success: false;
  error: {
    /** Error code */
    code: string;
    /** Human-readable message */
    message: string;
    /** Additional error details */
    details?: unknown;
  };
  meta: ApiResponseMeta;
}

/**
 * Service connection status values
 */
export type ServiceStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

/**
 * Base service information
 */
export interface ServiceInfo {
  /** Current connection status */
  status: ServiceStatus;
  /** Last error message if any */
  lastError?: string;
}

/**
 * Kromer WebSocket service information
 */
export interface KromerServiceInfo extends ServiceInfo {
  /** ISO 8601 datetime of last successful connection */
  lastConnectedAt?: string;
  /** Last transaction ID processed */
  lastTransactionId?: number;
}

/**
 * Chatbox service information
 */
export interface ChatboxServiceInfo extends ServiceInfo {
  /** Chatbox owner */
  owner?: string;
  /** Number of players in range */
  playerCount?: number;
}

/**
 * Discord service information
 */
export interface DiscordServiceInfo extends ServiceInfo {
  /** Discord bot username */
  username?: string;
  /** Number of registered commands */
  commandCount?: number;
}

/**
 * Basic service status for health check
 */
export interface HealthServices {
  kromerWs: ServiceInfo;
  chatbox: ServiceInfo;
  discord: ServiceInfo;
}

/**
 * Detailed service status for detailed health check
 */
export interface HealthServicesDetailed {
  kromerWs: KromerServiceInfo;
  chatbox: ChatboxServiceInfo;
  discord: DiscordServiceInfo;
}

/**
 * Health check results
 */
export interface HealthChecks {
  database: boolean;
  memory: boolean;
  kromerWs: boolean;
  chatbox: boolean;
  discord: boolean;
}

/**
 * Basic health check response
 */
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  name: string;
  /** Service connection statuses */
  services: HealthServices;
}

/**
 * Detailed health check response
 */
export interface DetailedHealthResponse {
  status: 'healthy' | 'degraded';
  checks: HealthChecks;
  details: {
    timestamp: string;
    uptime: number;
    version: string;
    name: string;
    memory: {
      heapUsed: string;
      heapTotal: string;
      rss: string;
    };
    node: string;
    platform: string;
  };
  /** Detailed service connection statuses */
  services: HealthServicesDetailed;
}

/**
 * Storage data response
 */
export interface StorageData {
  /** The stored ender storage data */
  data: unknown;
  /** ISO 8601 timestamp */
  retrievedAt: string;
}

/**
 * Report records response
 */
export interface ReportRecords {
  count: number;
  records: unknown[];
}

/**
 * Change log result (generic)
 */
export interface ChangeLogResult {
  /** Number of logs in this response */
  count: number;
  /** Total number of logs matching the query */
  total: number;
  logs: unknown[];
}

/**
 * Shop change log response
 */
export interface ShopChangeLogResponse {
  /** Number of logs in this response */
  count: number;
  /** Total number of logs matching the query */
  total: number;
  /** Array of shop change log entries */
  logs: ShopChangeLog[];
}

/**
 * Item change log response
 */
export interface ItemChangeLogResponse {
  /** Number of logs in this response */
  count: number;
  /** Total number of logs matching the query */
  total: number;
  /** Array of item change log entries */
  logs: ItemChangeLog[];
}

/**
 * Price change log response
 */
export interface PriceChangeLogResponse {
  /** Number of logs in this response */
  count: number;
  /** Total number of logs matching the query */
  total: number;
  /** Array of price change log entries */
  logs: PriceChangeLog[];
}

/**
 * Options for change log queries
 */
export interface ChangeLogOptions {
  /** Maximum records to return */
  limit?: number;
  /** Records to skip (pagination) */
  offset?: number;
  /** Filter by shop ID */
  shopId?: string;
  /** ISO 8601 datetime - filter changes after this time */
  since?: string;
  /** ISO 8601 datetime - filter changes before this time */
  until?: string;
}
