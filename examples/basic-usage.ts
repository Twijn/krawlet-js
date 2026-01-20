/**
 * Basic usage example for the Krawlet API client
 */
import { KrawletClient } from '../src';

async function main() {
  // Create a client instance
  const client = new KrawletClient({
    baseUrl: 'https://api.krawlet.cc',
    // apiKey: 'kraw_your_api_key_here', // Optional
  });

  console.log('🚀 Krawlet API Client - Basic Usage Example\n');

  // 1. Check API health
  console.log('1. Checking API health...');
  const health = await client.health.check();
  console.log(`   Status: ${health.status}`);
  console.log(`   Version: ${health.version}`);
  console.log(`   Uptime: ${health.uptime}s\n`);

  // 2. Get all players
  console.log('2. Fetching all players...');
  const players = await client.players.getAll();
  console.log(`   Found ${players.length} players`);
  if (players.length > 0) {
    const player = players[0];
    console.log(`   Example: ${player.minecraftName} (${player.kromerAddress})`);
  }
  console.log();

  // 3. Get all shops
  console.log('3. Fetching all shops...');
  const shops = await client.shops.getAll();
  console.log(`   Found ${shops.length} shops`);
  if (shops.length > 0) {
    const shop = shops[0];
    console.log(`   Example: ${shop.name} (ID: ${shop.id})`);
    console.log(`   Owner: ${shop.owner || 'Unknown'}`);
    console.log(`   Items: ${shop.items.length}`);
  }
  console.log();

  // 4. Get all items
  console.log('4. Fetching all items...');
  const items = await client.items.getAll();
  console.log(`   Found ${items.length} total item listings`);
  if (items.length > 0) {
    const item = items[0];
    console.log(`   Example: ${item.itemDisplayName || item.itemName}`);
    console.log(`   Shop: ${item.shopId}`);
    console.log(`   Stock: ${item.stock}`);
    if (item.prices.length > 0) {
      console.log(`   Price: ${item.prices[0].value} ${item.prices[0].currency}`);
    }
  }
  console.log();

  // 5. Get known addresses
  console.log('5. Fetching known addresses...');
  const addresses = await client.addresses.getAll();
  console.log(`   Found ${addresses.length} known addresses`);
  if (addresses.length > 0) {
    const address = addresses[0];
    console.log(`   Example: ${address.name} (${address.type})`);
    console.log(`   Address: ${address.address}`);
  }
  console.log();

  // 6. Check rate limit
  const rateLimit = client.getRateLimit();
  if (rateLimit) {
    console.log('6. Rate Limit Status:');
    console.log(`   Limit: ${rateLimit.limit} requests/hour`);
    console.log(`   Remaining: ${rateLimit.remaining}`);
    console.log(`   Resets: ${new Date(rateLimit.reset * 1000).toISOString()}`);
  }

  console.log('\n✅ Example completed successfully!');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
