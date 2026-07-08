const { Client } = require("pg");
const client = new Client({
  connectionString: "postgres://postgres:postgres@localhost:5439/medusa-store",
});

async function run() {
  await client.connect();
  console.log("Connected to database!");

  const res = await client.query(`
    UPDATE "invoice_config" 
    SET 
      company_name = 'LUMI Lighting',
      company_address = 'Lumi Showroom, 14 Kijabe Street, Nairobi, Kenya',
      company_phone = '+254 706 504 644',
      company_email = 'info@lumilighting.co.ke';
  `);

  console.log("Update result:", res);

  const finalConfig = await client.query('SELECT * FROM "invoice_config";');
  console.log("Updated configuration:", finalConfig.rows);

  await client.end();
}

run().catch(console.error);
