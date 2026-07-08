const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:postgres@localhost:5439/medusa-store',
});

async function run() {
  await client.connect();
  console.log('Connected to database!');
  
  // List all tables
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  console.log('--- Tables ---');
  console.log(tables.rows.map(r => r.table_name).join('\n'));
  
  await client.end();
}

run().catch(console.error);
