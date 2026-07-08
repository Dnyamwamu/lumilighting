const { Client } = require('pg');

// Retrieve database URL from .env or use the default local mapping
const client = new Client({
  connectionString: 'postgres://postgres:postgres@localhost:5439/medusa-store',
});

async function run() {
  await client.connect();
  console.log('Connected to database!');

  // 1. Total products
  const total = await client.query('SELECT count(*) FROM product;');
  console.log(`\nTotal products in database: ${total.rows[0].count}`);

  // 2. List all products with their handles
  const products = await client.query('SELECT id, title, handle FROM product ORDER BY title;');
  console.log('\n--- Products in Database ---');
  products.rows.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} (${p.handle}) [ID: ${p.id}]`);
  });

  // 3. Find if any product is linked to "Pendant Lights" category
  const pendantCatRes = await client.query("SELECT id, name FROM product_category WHERE handle = 'pendant-lights';");
  if (pendantCatRes.rows.length === 0) {
    console.log('\n❌ "Pendant Lights" category not found in database!');
  } else {
    const pendantCat = pendantCatRes.rows[0];
    console.log(`\nFound "Pendant Lights" Category ID: ${pendantCat.id}`);

    // Query links
    let links = [];
    try {
      const res = await client.query(`
        SELECT p.title, p.handle 
        FROM product p
        JOIN product_category_product pcp ON p.id = pcp.product_id
        WHERE pcp.product_category_id = $1;
      `, [pendantCat.id]);
      links = res.rows;
    } catch (e) {
      try {
        const res = await client.query(`
          SELECT p.title, p.handle 
          FROM product p
          JOIN product_product_category pcp ON p.id = pcp.product_id
          WHERE pcp.product_category_id = $1;
        `, [pendantCat.id]);
        links = res.rows;
      } catch (e2) {
        console.error('Failed to query category links:', e2.message);
      }
    }

    console.log('--- Products in "Pendant Lights" ---');
    if (links.length === 0) {
      console.log('No products assigned to "Pendant Lights".');
    } else {
      links.forEach(l => console.log(`- ${l.title} (${l.handle})`));
    }
  }

  await client.end();
}

run().catch(console.error);
