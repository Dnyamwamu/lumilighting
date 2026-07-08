const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:postgres@127.0.0.1:5439/medusa-store',
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database');

  const sql = `
    create table if not exists "product_category_image" (
      "id" text not null, 
      "url" text not null, 
      "file_id" text not null, 
      "type" text check ("type" in ('thumbnail', 'image')) not null, 
      "category_id" text not null, 
      "created_at" timestamptz not null default now(), 
      "updated_at" timestamptz not null default now(), 
      "deleted_at" timestamptz null, 
      constraint "product_category_image_pkey" primary key ("id")
    );
    CREATE INDEX IF NOT EXISTS "IDX_product_category_image_deleted_at" ON "product_category_image" (deleted_at) WHERE deleted_at IS NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "unique_thumbnail_per_category" ON "product_category_image" (category_id, type) WHERE type = 'thumbnail' AND deleted_at IS NULL;
  `;

  await client.query(sql);
  console.log('Migration queries executed successfully!');
  await client.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
