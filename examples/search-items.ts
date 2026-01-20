/**
 * Example showing how to search for items and compare prices
 */
import { KrawletClient } from '../src';
import type { Item } from '../src/types';

async function main() {
  const client = new KrawletClient();

  console.log('🔍 Krawlet API Client - Item Search Example\n');

  // Get all items
  const items = await client.items.getAll();
  console.log(`Loaded ${items.length} total item listings\n`);

  // Search for diamonds
  console.log('Searching for diamonds...');
  const diamonds = items.filter(
    (item) =>
      item.itemName === 'minecraft:diamond' ||
      item.itemDisplayName?.toLowerCase().includes('diamond'),
  );

  console.log(`Found ${diamonds.length} diamond listings:\n`);

  // Group by shop
  const diamondsByShop = diamonds.reduce(
    (acc, item) => {
      if (!acc[item.shopId]) {
        acc[item.shopId] = [];
      }
      acc[item.shopId].push(item);
      return acc;
    },
    {} as Record<string, Item[]>,
  );

  // Display results
  for (const [shopId, shopItems] of Object.entries(diamondsByShop)) {
    console.log(`Shop ${shopId}:`);
    for (const item of shopItems) {
      console.log(`  - ${item.itemDisplayName || item.itemName}`);
      console.log(`    Stock: ${item.stock}`);
      console.log(`    Buys from players: ${item.shopBuysItem ? 'Yes' : 'No'}`);

      if (item.prices.length > 0) {
        console.log('    Prices:');
        for (const price of item.prices) {
          console.log(
            `      ${price.value} ${price.currency}${price.address ? ` (${price.address})` : ''}`,
          );
        }
      }
      console.log();
    }
  }

  // Find cheapest
  const itemsWithPrices = diamonds.filter((item) => item.prices.length > 0);
  if (itemsWithPrices.length > 0) {
    const cheapest = itemsWithPrices.reduce((min, item) => {
      const itemMinPrice = Math.min(...item.prices.map((p) => p.value));
      const currentMinPrice = Math.min(...(min?.prices.map((p) => p.value) || [Infinity]));
      return itemMinPrice < currentMinPrice ? item : min;
    });

    console.log('🏆 Cheapest diamond:');
    console.log(`   Shop: ${cheapest.shopId}`);
    console.log(`   Price: ${cheapest.prices[0].value} ${cheapest.prices[0].currency}`);
    console.log(`   Stock: ${cheapest.stock}`);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
