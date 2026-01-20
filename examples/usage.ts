import { KrawletClient } from '../src';

/**
 * Basic usage example
 */
async function basicUsage() {
  // Create a client (anonymous - 100 requests/hour)
  const client = new KrawletClient();

  try {
    // Check API health
    const health = await client.health.check();
    console.log('API Status:', health.status);

    // Get all shops
    const shops = await client.shops.getAll();
    console.log(`Found ${shops.length} shops`);

    // Get all players
    const players = await client.players.getAll();
    console.log(`Found ${players.length} players`);

    // Get all items
    const items = await client.items.getAll();
    console.log(`Found ${items.length} items`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Authenticated usage example
 */
async function authenticatedUsage() {
  // Create a client with API key (1,000-5,000 requests/hour)
  const client = new KrawletClient({
    apiKey: 'kraw_your_api_key_here',
  });

  try {
    // Get all shops
    const shops = await client.shops.getAll();
    console.log('Shops:', shops);

    // Check rate limit
    const rateLimit = client.getRateLimit();
    if (rateLimit) {
      console.log(`Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`);
      const resetDate = new Date(rateLimit.reset * 1000);
      console.log(`Resets at: ${resetDate.toISOString()}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Player lookup examples
 */
async function playerLookup() {
  const client = new KrawletClient();

  try {
    // Find player by Kromer address
    const playersByAddress = await client.players.getByAddresses(['ks0d5iqb6p']);
    console.log('Players by address:', playersByAddress);

    // Find player by Minecraft name
    const playersByName = await client.players.getByNames(['Twijn']);
    console.log('Players by name:', playersByName);

    // Find player by UUID
    const playersByUuid = await client.players.getByUuids([
      'd98440d6-5117-4ac8-bd50-70b086101e3e',
    ]);
    console.log('Players by UUID:', playersByUuid);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Shop data examples
 */
async function shopData() {
  const client = new KrawletClient();

  try {
    // Get all shops
    const shops = await client.shops.getAll();
    console.log(`Total shops: ${shops.length}`);

    // Get specific shop
    const shop = await client.shops.get('123');
    console.log('Shop:', shop.name);
    console.log('Items:', shop.items.length);

    // Get items for a shop
    const items = await client.shops.getItems('123');
    console.log('Shop items:', items);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Report and analytics examples
 */
async function reports() {
  const client = new KrawletClient();

  try {
    // Get overall statistics
    const stats = await client.reports.getStats();
    console.log('Statistics:', stats);

    // Get shop change logs with filters
    const shopChanges = await client.reports.getShopChangeLogs({
      shopId: '123',
      since: '2026-01-01T00:00:00Z',
      limit: 100,
    });
    console.log('Shop changes:', shopChanges);

    // Get recent validation failures
    const failures = await client.reports.getValidationFailures({ limit: 10 });
    console.log('Recent failures:', failures);

    // Get successful posts
    const successes = await client.reports.getSuccessfulPosts({ limit: 10 });
    console.log('Successful posts:', successes);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * ShopSync update example (requires authentication)
 */
async function updateShop() {
  const client = new KrawletClient();

  const shopData = {
    info: {
      name: 'My Shop',
      description: 'A great shop',
      owner: 'PlayerName',
      computerID: 123,
      software: {
        name: 'ShopSync',
        version: '1.0.0',
      },
      location: {
        coordinates: [100, 64, -200] as [number, number, number],
        description: 'Near spawn',
        dimension: 'overworld',
      },
    },
    items: [
      {
        item: {
          name: 'minecraft:diamond',
          displayName: 'Diamond',
          description: 'A precious gem',
        },
        stock: 64,
        prices: [
          {
            value: 10,
            currency: 'KST',
            address: 'ks0d5iqb6p',
          },
        ],
      },
    ],
  };

  try {
    const result = await client.shops.update(shopData, 'kraw_shopsync_token_here');
    console.log('Update result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Storage example (requires authentication)
 */
async function storage() {
  const client = new KrawletClient();

  try {
    // Get stored data
    const data = await client.storage.get();
    console.log('Storage data:', data);

    // Store new data
    const newData = {
      items: [
        { name: 'minecraft:diamond', quantity: 64 },
        { name: 'minecraft:iron_ingot', quantity: 128 },
      ],
    };

    const result = await client.storage.set(newData, 'kraw_storage_token_here');
    console.log('Storage updated:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Error handling example
 */
async function errorHandling() {
  const client = new KrawletClient();

  try {
    // This will throw a SHOP_NOT_FOUND error
    await client.shops.get('nonexistent');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);

      // Check if it's a Krawlet API error
      const { KrawletError } = await import('../src');
      if (error instanceof KrawletError) {
        console.error('Error code:', error.code);
        console.error('Status code:', error.statusCode);
        console.error('Request ID:', error.requestId);

        if (error.isClientError()) {
          console.log('Client error (4xx)');
        }

        if (error.isRateLimitError()) {
          console.log('Rate limit exceeded - please wait');
        }
      }
    }
  }
}

/**
 * Custom configuration example
 */
async function customConfiguration() {
  // Configure for local development
  const client = new KrawletClient({
    baseUrl: 'http://localhost:3330/api',
    timeout: 10000,
    enableRetry: true,
    maxRetries: 5,
    retryDelay: 2000,
    headers: {
      'X-Custom-Header': 'value',
    },
  });

  try {
    const health = await client.health.check();
    console.log('Local API status:', health.status);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run examples
if (require.main === module) {
  console.log('=== Basic Usage ===');
  basicUsage().catch(console.error);
}
