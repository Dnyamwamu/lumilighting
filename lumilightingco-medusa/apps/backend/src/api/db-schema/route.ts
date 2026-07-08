import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const pgConnection = req.scope.resolve("__pg_connection__");

  try {
    console.log("Running analytics tables DDL queries...");

    // Create daily_sales
    await pgConnection.raw(`
      create table if not exists "daily_sales" (
        "id" text not null,
        "date" timestamptz not null,
        "revenue" bigint not null,
        "orders_count" integer not null,
        "avg_order_value" bigint not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "daily_sales_pkey" primary key ("id")
      );
    `);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_daily_sales_deleted_at" ON "daily_sales" ("deleted_at") WHERE deleted_at IS NULL;`);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_daily_sales_date" ON "daily_sales" ("date");`);

    // Create monthly_sales
    await pgConnection.raw(`
      create table if not exists "monthly_sales" (
        "id" text not null,
        "month" text not null,
        "revenue" bigint not null,
        "orders_count" integer not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "monthly_sales_pkey" primary key ("id")
      );
    `);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_monthly_sales_deleted_at" ON "monthly_sales" ("deleted_at") WHERE deleted_at IS NULL;`);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_monthly_sales_month" ON "monthly_sales" ("month");`);

    // Create product_sales
    await pgConnection.raw(`
      create table if not exists "product_sales" (
        "id" text not null,
        "product_title" text not null,
        "sold_quantity" integer not null,
        "revenue" bigint not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "product_sales_pkey" primary key ("id")
      );
    `);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_deleted_at" ON "product_sales" ("deleted_at") WHERE deleted_at IS NULL;`);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_product_title" ON "product_sales" ("product_title");`);

    // Create customer_metrics
    await pgConnection.raw(`
      create table if not exists "customer_metrics" (
        "id" text not null,
        "total_customers" integer not null,
        "new_customers_today" integer not null,
        "returning_customers" integer not null,
        "repeat_purchase_rate" double precision not null,
        "top_customers" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "customer_metrics_pkey" primary key ("id")
      );
    `);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_customer_metrics_deleted_at" ON "customer_metrics" ("deleted_at") WHERE deleted_at IS NULL;`);

    // Create inventory_metrics
    await pgConnection.raw(`
      create table if not exists "inventory_metrics" (
        "id" text not null,
        "total_products" integer not null,
        "in_stock" integer not null,
        "out_of_stock" integer not null,
        "low_stock" integer not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "inventory_metrics_pkey" primary key ("id")
      );
    `);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_inventory_metrics_deleted_at" ON "inventory_metrics" ("deleted_at") WHERE deleted_at IS NULL;`);

    // Create mpesa_transaction
    await pgConnection.raw(`
      create table if not exists "mpesa_transaction" (
        "id" text not null,
        "merchant_request_id" text not null,
        "checkout_request_id" text not null,
        "amount" double precision not null,
        "phone_number" text not null,
        "status" text not null,
        "result_code" integer null,
        "result_desc" text null,
        "mpesa_receipt_number" text null,
        "transaction_date" text null,
        "cart_id" text null,
        "order_id" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "mpesa_transaction_pkey" primary key ("id")
      );
    `);

    // Migrate table if it already exists
    await pgConnection.raw(`
      ALTER TABLE "mpesa_transaction" ADD COLUMN IF NOT EXISTS "cart_id" text null;
    `);
    await pgConnection.raw(`
      ALTER TABLE "mpesa_transaction" ADD COLUMN IF NOT EXISTS "order_id" text null;
    `);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_mpesa_transaction_deleted_at" ON "mpesa_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_mpesa_transaction_merchant_req" ON "mpesa_transaction" ("merchant_request_id") WHERE deleted_at IS NULL;`);
    await pgConnection.raw(`CREATE INDEX IF NOT EXISTS "IDX_mpesa_transaction_checkout_req" ON "mpesa_transaction" ("checkout_request_id") WHERE deleted_at IS NULL;`);

    // Fetch table list to verify
    const tablesRes = await pgConnection.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('daily_sales', 'monthly_sales', 'product_sales', 'customer_metrics', 'inventory_metrics', 'mpesa_transaction')
      ORDER BY table_name;
    `);

    return res.json({
      success: true,
      created_tables: tablesRes.rows ? tablesRes.rows.map((r: any) => r.table_name) : tablesRes
    });
  } catch (error: any) {
    console.error("Error creating tables:", error);
    return res.status(500).json({
      success: false,
      error: error.message || error
    });
  }
};
