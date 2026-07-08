const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:postgres@localhost:5439/medusa-store',
});

async function run() {
  await client.connect();
  console.log('Connected to database!');
  
  // 1. Get all sales channels
  const channels = await client.query('SELECT id, name, is_disabled, deleted_at FROM sales_channel;');
  console.log('--- Sales Channels ---');
  console.log(JSON.stringify(channels.rows, null, 2));

  // 2. Get all stock locations
  const locations = await client.query('SELECT id, name, deleted_at FROM stock_location;');
  console.log('--- Stock Locations ---');
  console.log(JSON.stringify(locations.rows, null, 2));

  // 3. Get sales channel stock locations
  const links = await client.query('SELECT * FROM sales_channel_stock_location;');
  console.log('--- Sales Channel Stock Location Links ---');
  console.log(JSON.stringify(links.rows, null, 2));

  // 4. Get inventory items & levels for variant variant_01KVJFR57RC2CNF4SEKZQQQBWM
  const variantId = 'variant_01KVJFR57RC2CNF4SEKZQQQBWM';
  
  // Find product variant
  const variant = await client.query('SELECT id, title, sku, product_id, deleted_at FROM product_variant WHERE id = $1;', [variantId]);
  console.log('--- Variant ---');
  console.log(JSON.stringify(variant.rows, null, 2));

  // Find inventory item linked to variant
  try {
    const invItems = await client.query('SELECT * FROM product_variant_inventory_item WHERE variant_id = $1;', [variantId]);
    console.log('--- Product Variant Inventory Item Links ---');
    console.log(JSON.stringify(invItems.rows, null, 2));
    if (invItems.rows.length > 0) {
      const itemIds = invItems.rows.map(r => r.inventory_item_id);
      const levels = await client.query('SELECT * FROM inventory_level WHERE inventory_item_id = ANY($1);', [itemIds]);
      console.log('--- Inventory Levels for Variant ---');
      console.log(JSON.stringify(levels.rows, null, 2));
    }
  } catch (err) {
    console.error('Error fetching inventory item / level: ', err.message);
  }

  await client.end();
}

run().catch(console.error);
