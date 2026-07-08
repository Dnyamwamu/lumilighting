import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260614160900 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
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
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_daily_sales_deleted_at" ON "daily_sales" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_daily_sales_date" ON "daily_sales" ("date");`);

    this.addSql(`
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
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_monthly_sales_deleted_at" ON "monthly_sales" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_monthly_sales_month" ON "monthly_sales" ("month");`);

    this.addSql(`
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
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_deleted_at" ON "product_sales" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_product_title" ON "product_sales" ("product_title");`);

    this.addSql(`
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
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_metrics_deleted_at" ON "customer_metrics" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`
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
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_inventory_metrics_deleted_at" ON "inventory_metrics" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`
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
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "mpesa_transaction_pkey" primary key ("id")
      );
    `);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mpesa_transaction_deleted_at" ON "mpesa_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mpesa_transaction_merchant_req" ON "mpesa_transaction" ("merchant_request_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mpesa_transaction_checkout_req" ON "mpesa_transaction" ("checkout_request_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "daily_sales" cascade;`);
    this.addSql(`drop table if exists "monthly_sales" cascade;`);
    this.addSql(`drop table if exists "product_sales" cascade;`);
    this.addSql(`drop table if exists "customer_metrics" cascade;`);
    this.addSql(`drop table if exists "inventory_metrics" cascade;`);
    this.addSql(`drop table if exists "mpesa_transaction" cascade;`);
  }
}
