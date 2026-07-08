-- Populate KES prices for all price sets that have USD prices
INSERT INTO price (id, currency_code, amount, raw_amount, price_set_id, created_at, updated_at)
SELECT 
  'price_' || substring(md5(random()::text) from 1 for 20) as id,
  'kes' as currency_code,
  (amount * 13000) as amount, -- Multiply USD amount by 130 (conversion rate) and then by 100 (for cents/base units)
  jsonb_build_object('value', (amount * 13000)::text, 'precision', 20) as raw_amount,
  price_set_id,
  NOW() as created_at,
  NOW() as updated_at
FROM price p
WHERE currency_code = 'usd'
  AND NOT EXISTS (
    SELECT 1 FROM price p2 
    WHERE p2.price_set_id = p.price_set_id 
      AND p2.currency_code = 'kes'
  )
ON CONFLICT DO NOTHING;
