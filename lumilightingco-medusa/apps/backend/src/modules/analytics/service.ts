import { InjectManager, MedusaService, MedusaContext } from "@medusajs/framework/utils"
import { Context } from "@medusajs/framework/types"
import { EntityManager } from "@medusajs/framework/mikro-orm/knex"
import DailySales from "./models/daily-sales"
import MonthlySales from "./models/monthly-sales"
import ProductSales from "./models/product-sales"
import CustomerMetrics from "./models/customer-metrics"
import InventoryMetrics from "./models/inventory-metrics"
import MpesaTransaction from "./models/mpesa-transaction"

class AnalyticsModuleService extends MedusaService({
  DailySales,
  MonthlySales,
  ProductSales,
  CustomerMetrics,
  InventoryMetrics,
  MpesaTransaction,
}) {
  @InjectManager()
  async syncAnalytics(
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<void> {
    const manager = sharedContext?.manager
    if (!manager) {
      console.error("No entity manager available for analytics sync")
      return
    }

    try {
      console.log("Running Analytics Data Warehouse Sync...")

      // 1. Sync Daily Sales
      await manager.execute(`
        DELETE FROM daily_sales;
        INSERT INTO daily_sales (id, date, revenue, orders_count, avg_order_value, created_at, updated_at)
        SELECT 
          date_str as id,
          (date_str || ' 00:00:00 Africa/Nairobi')::timestamptz as date,
          revenue,
          orders_count,
          avg_order_value,
          NOW(),
          NOW()
        FROM (
          SELECT 
            TO_CHAR(created_at AT TIME ZONE 'Africa/Nairobi', 'YYYY-MM-DD') as date_str,
            COALESCE(SUM(total), 0) as revenue,
            COUNT(*) as orders_count,
            COALESCE(AVG(total), 0) as avg_order_value
          FROM "order"
          WHERE deleted_at IS NULL AND status::text != 'canceled'
          GROUP BY date_str
        ) t;
      `)

      // 2. Sync Monthly Sales
      await manager.execute(`
        DELETE FROM monthly_sales;
        INSERT INTO monthly_sales (id, month, revenue, orders_count, created_at, updated_at)
        SELECT 
          month_str as id,
          month_str as month,
          revenue,
          orders_count,
          NOW(),
          NOW()
        FROM (
          SELECT 
            TO_CHAR(created_at AT TIME ZONE 'Africa/Nairobi', 'YYYY-MM') as month_str,
            COALESCE(SUM(total), 0) as revenue,
            COUNT(*) as orders_count
          FROM "order"
          WHERE deleted_at IS NULL AND status::text != 'canceled'
          GROUP BY month_str
        ) t;
      `)

      // 3. Sync Product Sales
      await manager.execute(`
        DELETE FROM product_sales;
        INSERT INTO product_sales (id, product_title, sold_quantity, revenue, created_at, updated_at)
        SELECT 
          oli.product_id as id,
          oli.product_title,
          COALESCE(SUM(oi.quantity), 0) as sold_quantity,
          COALESCE(SUM(oli.unit_price * oi.quantity), 0) as revenue,
          NOW(),
          NOW()
        FROM order_item oi
        JOIN order_line_item oli ON oi.item_id = oli.id
        JOIN "order" o ON oi.order_id = o.id
        WHERE o.deleted_at IS NULL AND o.status::text != 'canceled' AND oli.product_id IS NOT NULL
        GROUP BY oli.product_id, oli.product_title;
      `)

      // 4. Sync Customer Metrics
      await manager.execute(`
        DELETE FROM customer_metrics;
        INSERT INTO customer_metrics (id, total_customers, new_customers_today, returning_customers, repeat_purchase_rate, top_customers, created_at, updated_at)
        SELECT
          'singleton' as id,
          (SELECT COUNT(*)::integer FROM customer WHERE deleted_at IS NULL) as total_customers,
          (SELECT COUNT(*)::integer FROM customer WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE) as new_customers_today,
          (SELECT COUNT(*)::integer FROM (
            SELECT customer_id FROM "order" 
            WHERE deleted_at IS NULL AND status::text != 'canceled' AND customer_id IS NOT NULL 
            GROUP BY customer_id HAVING COUNT(*) > 1
          ) r) as returning_customers,
          COALESCE(
            (SELECT COUNT(*)::float FROM (
              SELECT customer_id FROM "order" 
              WHERE deleted_at IS NULL AND status::text != 'canceled' AND customer_id IS NOT NULL 
              GROUP BY customer_id HAVING COUNT(*) > 1
            ) r) / NULLIF((SELECT COUNT(DISTINCT customer_id)::float FROM "order" WHERE deleted_at IS NULL AND status::text != 'canceled' AND customer_id IS NOT NULL), 0),
            0
          ) as repeat_purchase_rate,
          COALESCE(
            (
              SELECT json_agg(t) FROM (
                SELECT 
                  c.id,
                  c.first_name,
                  c.last_name,
                  c.email,
                  COUNT(o.id) as orders_count,
                  SUM(o.total) as total_spent
                FROM customer c
                JOIN "order" o ON c.id = o.customer_id
                WHERE c.deleted_at IS NULL AND o.deleted_at IS NULL AND o.status::text != 'canceled'
                GROUP BY c.id, c.first_name, c.last_name, c.email
                ORDER BY total_spent DESC
                LIMIT 10
              ) t
            )::text,
            '[]'
          ) as top_customers,
          NOW(),
          NOW();
      `)

      // 5. Sync Inventory Metrics
      await manager.execute(`
        DELETE FROM inventory_metrics;
        INSERT INTO inventory_metrics (id, total_products, in_stock, out_of_stock, low_stock, created_at, updated_at)
        SELECT
          'singleton' as id,
          (SELECT COUNT(*)::integer FROM product WHERE deleted_at IS NULL) as total_products,
          COALESCE(
            (SELECT COUNT(DISTINCT p.id)::integer FROM product p
             LEFT JOIN product_variant pv ON p.id = pv.product_id
             LEFT JOIN product_variant_inventory_item pvii ON pv.id = pvii.variant_id
             LEFT JOIN inventory_level il ON pvii.inventory_item_id = il.inventory_item_id
             WHERE p.deleted_at IS NULL AND pv.deleted_at IS NULL
             GROUP BY p.id
             HAVING MIN(COALESCE(il.stocked_quantity, 0) - COALESCE(il.reserved_quantity, 0)) > 0
             LIMIT 1
            ), 0
          ) as in_stock,
          COALESCE(
            (SELECT COUNT(DISTINCT p.id)::integer FROM product p
             LEFT JOIN product_variant pv ON p.id = pv.product_id
             LEFT JOIN product_variant_inventory_item pvii ON pv.id = pvii.variant_id
             LEFT JOIN inventory_level il ON pvii.inventory_item_id = il.inventory_item_id
             WHERE p.deleted_at IS NULL AND pv.deleted_at IS NULL
             GROUP BY p.id
             HAVING MAX(COALESCE(il.stocked_quantity, 0) - COALESCE(il.reserved_quantity, 0)) <= 0
             LIMIT 1
            ), 0
          ) as out_of_stock,
          COALESCE(
            (SELECT COUNT(DISTINCT p.id)::integer FROM product p
             LEFT JOIN product_variant pv ON p.id = pv.product_id
             LEFT JOIN product_variant_inventory_item pvii ON pv.id = pvii.variant_id
             LEFT JOIN inventory_level il ON pvii.inventory_item_id = il.inventory_item_id
             WHERE p.deleted_at IS NULL AND pv.deleted_at IS NULL AND (COALESCE(il.stocked_quantity, 0) - COALESCE(il.reserved_quantity, 0)) < 10
             LIMIT 1
            ), 0
          ) as low_stock,
          NOW(),
          NOW();
      `)

      console.log("Analytics Data Warehouse Sync Completed Successfully!")
    } catch (err) {
      console.error("Error executing Analytics Data Warehouse Sync:", err)
    }
  }
}

export default AnalyticsModuleService
