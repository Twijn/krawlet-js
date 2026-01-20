/**
 * Example showing error handling
 */
import { KrawletClient, KrawletError } from '../src';

async function main() {
  const client = new KrawletClient();

  console.log('⚠️  Krawlet API Client - Error Handling Example\n');

  // Example 1: Handle 404 error
  console.log('1. Attempting to fetch non-existent shop...');
  try {
    await client.shops.get('nonexistent-shop-id');
  } catch (error) {
    if (error instanceof KrawletError) {
      console.log(`   ❌ Error caught:`);
      console.log(`      Code: ${error.code}`);
      console.log(`      Status: ${error.statusCode}`);
      console.log(`      Message: ${error.message}`);
      console.log(`      Request ID: ${error.requestId}`);
      console.log(`      Is client error: ${error.isClientError()}`);
      console.log(`      Is server error: ${error.isServerError()}`);
    }
  }
  console.log();

  // Example 2: Handle invalid authentication
  console.log('2. Attempting unauthorized operation...');
  try {
    await client.shops.update(
      {
        info: {
          name: 'Test',
          computerID: 123,
        },
        items: [],
      },
      'invalid_token',
    );
  } catch (error) {
    if (error instanceof KrawletError) {
      console.log(`   ❌ Error caught:`);
      console.log(`      Code: ${error.code}`);
      console.log(`      Message: ${error.message}`);

      if (error.code === 'UNAUTHORIZED') {
        console.log(`      💡 Tip: Check your API token`);
      }
    }
  }
  console.log();

  // Example 3: Graceful error handling
  console.log('3. Graceful error handling with fallback...');
  try {
    const shop = await client.shops.get('maybe-exists');
    console.log(`   ✅ Shop found: ${shop.name}`);
  } catch (error) {
    if (error instanceof KrawletError && error.code === 'SHOP_NOT_FOUND') {
      console.log(`   ℹ️  Shop not found, using default values`);
      const fallback = {
        id: 'unknown',
        name: 'Unknown Shop',
        items: [],
      };
      console.log(`   Fallback: ${JSON.stringify(fallback, null, 2)}`);
    } else {
      console.log(`   ❌ Unexpected error: ${error}`);
    }
  }
  console.log();

  // Example 4: Check error types
  console.log('4. Error type checking...');
  const testErrors = [
    new KrawletError('Bad Request', 'BAD_REQUEST', 400),
    new KrawletError('Not Found', 'NOT_FOUND', 404),
    new KrawletError('Rate Limited', 'RATE_LIMIT_EXCEEDED', 429),
    new KrawletError('Server Error', 'INTERNAL_ERROR', 500),
  ];

  for (const error of testErrors) {
    console.log(`   ${error.message} (${error.statusCode}):`);
    console.log(`      Client error: ${error.isClientError()}`);
    console.log(`      Server error: ${error.isServerError()}`);
    console.log(`      Rate limit: ${error.isRateLimitError()}`);
  }

  console.log('\n✅ Error handling examples completed!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
