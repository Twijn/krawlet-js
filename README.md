# krawlet-js

> TypeScript/JavaScript client library for the Krawlet Minecraft economy tracking API

[![npm version](https://img.shields.io/npm/v/krawlet-js.svg)](https://www.npmjs.com/package/krawlet-js)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [Health](#health)
  - [Players](#players)
  - [Shops](#shops)
  - [Items](#items)
  - [Addresses](#addresses)
  - [Storage](#storage)
  - [Reports](#reports)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
- [Development](#development)
- [License](#license)

## Installation

```bash
# Using pnpm
pnpm add krawlet-js

# Using npm
npm install krawlet-js

# Using yarn
yarn add krawlet-js
```

**Requirements:**
- Node.js 18.x or higher (for native `fetch` support)
- TypeScript 5.x (optional, but recommended)

## Quick Start

```typescript
import { KrawletClient } from 'krawlet-js';

// Create a client (anonymous - 100 requests/hour)
const client = new KrawletClient();

// Get all shops
const shops = await client.shops.getAll();
console.log(`Found ${shops.length} shops`);

// Find a player by Kromer address
const players = await client.players.getByAddresses(['ks0d5iqb6p']);
console.log('Player:', players[0]?.minecraftName);
```

### With Authentication

```typescript
import { KrawletClient } from 'krawlet-js';

// Authenticated client (1,000-5,000 requests/hour)
const client = new KrawletClient({
  apiKey: 'kraw_your_api_key_here',
});

const shops = await client.shops.getAll();
```

## Configuration

```typescript
const client = new KrawletClient({
  // API base URL (default: 'https://api.krawlet.cc')
  baseUrl: 'https://api.krawlet.cc',
  
  // Optional API key for authentication
  apiKey: 'kraw_your_key_here',
  
  // Request timeout in milliseconds (default: 30000)
  timeout: 30000,
  
  // Custom headers to include in all requests
  headers: {
    'X-Custom-Header': 'value',
  },
  
  // Enable automatic retry on failure (default: true)
  enableRetry: true,
  
  // Maximum number of retries (default: 3)
  maxRetries: 3,
  
  // Initial retry delay in milliseconds (default: 1000)
  retryDelay: 1000,
});
```

### Local Development

```typescript
const client = new KrawletClient({
  baseUrl: 'http://localhost:3330/api',
});
```

## API Reference

### Health

Check API status and health.

```typescript
// Basic health check
const health = await client.health.check();
console.log(health.status); // "ok"

// Detailed health check with system metrics
const detailed = await client.health.detailed();
console.log(detailed.status); // "healthy" | "degraded"
console.log(detailed.details.memory);
```

### Players

Retrieve player information.

```typescript
// Get all players
const allPlayers = await client.players.getAll();

// Find by Kromer addresses
const byAddress = await client.players.getByAddresses(['ks0d5iqb6p', 'k12345678']);

// Find by Minecraft names (case-insensitive)
const byName = await client.players.getByNames(['Twijn', 'Player2']);

// Find by Minecraft UUIDs
const byUuid = await client.players.getByUuids([
  'd98440d6-5117-4ac8-bd50-70b086101e3e',
]);
```

### Shops

Manage shop data and listings.

```typescript
// Get all shops
const shops = await client.shops.getAll();

// Get a specific shop by ID
const shop = await client.shops.get('123');

// Get items for a shop
const items = await client.shops.getItems('123');

// Update a shop (requires ShopSync authentication)
const shopData = {
  sourceType: 'modem', // Optional: 'modem' (default) or 'radio_tower'
  info: {
    name: 'My Shop',
    description: 'A great shop',
    owner: 'PlayerName',
    computerID: 123,
    software: { name: 'ShopSync', version: '1.0.0' },
    location: {
      coordinates: [100, 64, -200],
      description: 'Near spawn',
      dimension: 'overworld',
    },
  },
  items: [
    {
      item: {
        name: 'minecraft:diamond',
        displayName: 'Diamond',
      },
      stock: 64,
      prices: [{ value: 10, currency: 'KST', address: 'ks0d5iqb6p' }],
    },
  ],
};

await client.shops.update(shopData, 'kraw_shopsync_token');
```

#### Shop Source Types

The `sourceType` field indicates how a shop was added to the system:

| Type | Description |
|------|-------------|
| `modem` | Shop was added via direct modem connection (default) |
| `radio_tower` | Shop was added via CC Radio Tower (remote/relay) |

```typescript
import type { Shop, ShopSourceType } from 'krawlet-js';

const shop: Shop = await client.shops.get('123');
console.log(shop.sourceType); // 'modem' or 'radio_tower'
```

### Items

Retrieve item listings across all shops.

```typescript
// Get all items with prices
const items = await client.items.getAll();

// Filter diamonds
const diamonds = items.filter(item => item.itemName === 'minecraft:diamond');
```

### Addresses

Get known Kromer addresses.

```typescript
// Get all known addresses
const addresses = await client.addresses.getAll();

// Filter by type
const shops = addresses.filter(addr => addr.type === 'shop');
```

### Storage

Manage ender storage data (requires authentication).

```typescript
// Get stored data
const data = await client.storage.get();
console.log(data.data);
console.log(data.retrievedAt);

// Store new data
const newData = {
  items: [
    { name: 'minecraft:diamond', quantity: 64 },
  ],
};

await client.storage.set(newData, 'kraw_storage_token');
```

### Reports

Access ShopSync statistics and change logs.

```typescript
// Get overall statistics
const stats = await client.reports.getStats();

// Get shop change logs with filters
const shopChanges = await client.reports.getShopChangeLogs({
  shopId: '123',
  since: '2026-01-01T00:00:00Z',
  limit: 100,
  offset: 0,
});

// Get item changes
const itemChanges = await client.reports.getItemChangeLogs({
  shopId: '123',
  limit: 50,
});

// Get price changes
const priceChanges = await client.reports.getPriceChangeLogs({
  since: '2026-01-15T00:00:00Z',
  until: '2026-01-20T00:00:00Z',
});

// Get validation failures
const failures = await client.reports.getValidationFailures({ limit: 10 });

// Get successful posts
const successes = await client.reports.getSuccessfulPosts({ limit: 10 });

// Get specific report
const report = await client.reports.get('report-id');
```

## Error Handling

The library provides a custom `KrawletError` class for API errors.

```typescript
import { KrawletError, ErrorCode } from 'krawlet-js';

try {
  await client.shops.get('nonexistent');
} catch (error) {
  if (error instanceof KrawletError) {
    console.error('Error code:', error.code);
    console.error('Status code:', error.statusCode);
    console.error('Request ID:', error.requestId);
    console.error('Message:', error.message);
    
    // Check error type
    if (error.isClientError()) {
      console.log('Client error (4xx)');
    }
    
    if (error.isServerError()) {
      console.log('Server error (5xx)');
    }
    
    if (error.isRateLimitError()) {
      console.log('Rate limit exceeded');
    }
    
    // Check specific error codes
    if (error.code === ErrorCode.SHOP_NOT_FOUND) {
      console.log('Shop does not exist');
    }
  }
}
```

### Error Codes

Common error codes:

- `BAD_REQUEST` - Invalid request
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SHOP_NOT_FOUND` - Shop doesn't exist
- `PLAYER_NOT_FOUND` - Player doesn't exist
- `INTERNAL_ERROR` - Server error
- `DATABASE_ERROR` - Database error

## Rate Limiting

The API enforces rate limits based on authentication:

- **Anonymous**: 100 requests/hour
- **Free tier**: 1,000 requests/hour
- **Premium tier**: 5,000 requests/hour

Check your current rate limit status:

```typescript
const shops = await client.shops.getAll();

const rateLimit = client.getRateLimit();
if (rateLimit) {
  console.log(`${rateLimit.remaining}/${rateLimit.limit} requests remaining`);
  
  const resetDate = new Date(rateLimit.reset * 1000);
  console.log(`Resets at: ${resetDate.toISOString()}`);
}
```

The client automatically retries requests when rate limits are exceeded with exponential backoff.

## TypeScript Support

The library is written in TypeScript and provides full type definitions.

```typescript
import type { Shop, Item, Player, ShopSourceType, KrawletError } from 'krawlet-js';

// All responses are fully typed
const shops: Shop[] = await client.shops.getAll();
const shop: Shop = shops[0];
const items: Item[] = shop.items;
```

## Examples

See the [examples](./examples) directory for more usage examples:

- [Basic Usage](./examples/usage.ts#basicUsage)
- [Player Lookup](./examples/usage.ts#playerLookup)
- [Shop Data](./examples/usage.ts#shopData)
- [Reports & Analytics](./examples/usage.ts#reports)
- [Error Handling](./examples/usage.ts#errorHandling)
- [Custom Configuration](./examples/usage.ts#customConfiguration)

## Development

```bash
# Install dependencies
pnpm install

# Build the library
pnpm run build

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Lint code
pnpm run lint

# Format code
pnpm run format

# Development mode (watch for changes)
pnpm run dev
```

### Project Structure

```
krawlet-js/
├── src/
│   ├── resources/          # API resource classes
│   │   ├── health.ts
│   │   ├── players.ts
│   │   ├── shops.ts
│   │   ├── items.ts
│   │   ├── addresses.ts
│   │   ├── storage.ts
│   │   └── reports.ts
│   ├── __tests__/          # Unit tests
│   ├── client.ts           # Main client class
│   ├── http-client.ts      # HTTP client implementation
│   ├── error.ts            # Error handling
│   ├── types.ts            # TypeScript types
│   └── index.ts            # Main entry point
├── examples/               # Usage examples
└── dist/                   # Built output
```

## License

ISC

---

## Links

- **API Documentation**: https://api.krawlet.cc
- **Production URL**: https://api.krawlet.cc
- **Local Dev URL**: http://localhost:3330/api

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
