/**
 * Example showing how to monitor shop changes
 */
import { KrawletClient } from '../src';

async function main() {
  const client = new KrawletClient();

  console.log('📊 Krawlet API Client - Shop Monitoring Example\n');

  // Get report statistics
  console.log('1. Fetching report statistics...');
  const stats = await client.reports.getStats();
  console.log('   Statistics:', JSON.stringify(stats, null, 2));
  console.log();

  // Get recent shop changes
  console.log('2. Fetching recent shop changes...');
  const shopChanges = await client.reports.getShopChanges({ limit: 10 });
  console.log(`   Found ${shopChanges.count} shop changes`);
  if (shopChanges.records.length > 0) {
    console.log(`   Most recent changes:`);
    shopChanges.records.slice(0, 5).forEach((record: any) => {
      console.log(`      - ${JSON.stringify(record)}`);
    });
  }
  console.log();

  // Get recent item changes
  console.log('3. Fetching recent item changes...');
  const itemChanges = await client.reports.getItemChanges({ limit: 10 });
  console.log(`   Found ${itemChanges.count} item changes`);
  if (itemChanges.records.length > 0) {
    console.log(`   Most recent changes:`);
    itemChanges.records.slice(0, 5).forEach((record: any) => {
      console.log(`      - ${JSON.stringify(record)}`);
    });
  }
  console.log();

  // Get detailed shop change logs
  console.log('4. Fetching detailed shop change logs...');
  const shopLogs = await client.reports.getShopChangeLogs({
    limit: 5,
  });
  console.log(`   Found ${shopLogs.count} total logs`);
  if (shopLogs.logs.length > 0) {
    console.log(`   Recent logs:`);
    shopLogs.logs.forEach((log: any) => {
      console.log(`      Shop: ${log.shopName}`);
      console.log(`      Field: ${log.field}`);
      console.log(`      Changed: "${log.previousValue}" → "${log.newValue}"`);
      console.log(`      Time: ${log.createdAt}`);
      console.log();
    });
  }

  // Get price change logs with filter
  console.log('5. Fetching price changes from last 24 hours...');
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const priceLogs = await client.reports.getPriceChangeLogs({
    since: yesterday,
    limit: 10,
  });
  console.log(`   Found ${priceLogs.count} price changes`);
  if (priceLogs.logs.length > 0) {
    priceLogs.logs.forEach((log: any) => {
      console.log(`      ${log.itemDisplayName} at ${log.shopName}:`);
      console.log(`      ${log.previousValue} → ${log.newValue}`);
    });
  }

  console.log('\n✅ Monitoring example completed!');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
