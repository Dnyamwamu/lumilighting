import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260612123357 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "quickbooks_token" ("id" text not null, "access_token" text not null, "refresh_token" text not null, "expires_at" timestamptz not null, "refresh_token_expires_at" timestamptz not null, "realm_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quickbooks_token_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quickbooks_token_deleted_at" ON "quickbooks_token" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "quickbooks_token" cascade;`);
  }

}
