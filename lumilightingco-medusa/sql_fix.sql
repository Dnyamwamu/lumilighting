-- 1. Undelete the soft-deleted link for European Warehouse
UPDATE sales_channel_stock_location 
SET deleted_at = NULL 
WHERE sales_channel_id = 'sc_01KTPMK9HEZAC64TYW9PMMB1YK' 
  AND stock_location_id = 'sloc_01KTPMK9K9PQW024R4GBAJJ86P';

-- 2. Link LUMI Lighting Sales Channel to the new LUMI Lighting Showroom
INSERT INTO sales_channel_stock_location (id, sales_channel_id, stock_location_id, created_at, updated_at)
VALUES ('scloc_01KTRXQVM6YBGM3XH1S2BM5R9AA', 'sc_01KTPMK9HEZAC64TYW9PMMB1YK', 'sloc_01KTQNDQDC0QHT8ERWFVZDKW9Z', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3. Link Default Sales Channel to Kijabe Store
INSERT INTO sales_channel_stock_location (id, sales_channel_id, stock_location_id, created_at, updated_at)
VALUES ('scloc_01KTRXQVM6YBGM3XH1S2BM5R9AB', 'sc_01KTQ588TWRB1PV2B5KA6ENX9W', 'sloc_01KTPR7EXFTKWYKPWFVK769SZW', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Link Default Sales Channel to European Warehouse
INSERT INTO sales_channel_stock_location (id, sales_channel_id, stock_location_id, created_at, updated_at)
VALUES ('scloc_01KTRXQVM6YBGM3XH1S2BM5R9AC', 'sc_01KTQ588TWRB1PV2B5KA6ENX9W', 'sloc_01KTPMK9K9PQW024R4GBAJJ86P', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 5. Link the storefront's API Key (apk_01KTPQ87B80TB4X2E3MV3BKCDZ) to the Default Sales Channel (sc_01KTQ588TWRB1PV2B5KA6ENX9W)
INSERT INTO publishable_api_key_sales_channel (id, publishable_key_id, sales_channel_id, created_at, updated_at)
VALUES ('pksc_01KTQ588VA8D0FHF5J271QR2AB', 'apk_01KTPQ87B80TB4X2E3MV3BKCDZ', 'sc_01KTQ588TWRB1PV2B5KA6ENX9W', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 6. Also link all products to the storefront's primary sales channel (sc_01KTPMK9HEZAC64TYW9PMMB1YK) if they aren't already
INSERT INTO product_sales_channel (id, product_id, sales_channel_id, created_at, updated_at)
SELECT 
  'prodsc_' || substring(md5(random()::text) from 1 for 18) as id,
  p.id as product_id,
  'sc_01KTPMK9HEZAC64TYW9PMMB1YK' as sales_channel_id,
  NOW() as created_at,
  NOW() as updated_at
FROM product p
WHERE NOT EXISTS (
  SELECT 1 FROM product_sales_channel psc 
  WHERE psc.product_id = p.id AND psc.sales_channel_id = 'sc_01KTPMK9HEZAC64TYW9PMMB1YK'
)
ON CONFLICT DO NOTHING;
