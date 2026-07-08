const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/medusa-store',
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT token, title FROM publishable_api_key WHERE deleted_at IS NULL;');
  console.log('--- Active Publishable Keys ---');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
