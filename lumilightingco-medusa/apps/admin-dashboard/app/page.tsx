import { query } from "../lib/db";
import { fetchQuickBooksFinancials } from "../lib/quickbooks";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

async function ensureDataWarehouse() {
  return; // Seeding disabled to show zero/empty figures
  try {
    // Check if daily_sales has any records
    const check = await query('SELECT COUNT(*)::integer as count FROM daily_sales');
    const count = check.rows[0]?.count || 0;

    if (count === 0) {
      console.log("Seeding analytics data warehouse with sample data...");

      // Seed daily_sales (past 30 days)
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        // Generate a nice curve of sales
        const baseVal = 70000 + Math.sin((30 - i) / 5) * 30000;
        const revenue = Math.floor(baseVal + Math.random() * 50000) * 100; // in cents
        const orders = Math.floor(8 + Math.random() * 18);
        const avgVal = Math.floor(revenue / orders);

        await query(
          `INSERT INTO daily_sales (id, date, revenue, orders_count, avg_order_value)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [dateStr, date, revenue, orders, avgVal]
        );
      }

      // Seed monthly_sales (past 6 months)
      const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
      const monthlyRevenues = [185000000, 210000000, 195000000, 240000000, 285000000, 310000000]; // in cents
      const monthlyOrders = [420, 480, 440, 520, 610, 680];

      for (let i = 0; i < months.length; i++) {
        await query(
          `INSERT INTO monthly_sales (id, month, revenue, orders_count)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO NOTHING`,
          [months[i], months[i], monthlyRevenues[i], monthlyOrders[i]]
        );
      }

      // Seed product_sales (top 5 products)
      const products = [
        { id: "prod_1", title: "LUMI LED Filament Bulb 4W", qty: 340, rev: 340 * 850 * 100 },
        { id: "prod_2", title: "LUMI Track Light 12W Black", qty: 210, rev: 210 * 2400 * 100 },
        { id: "prod_3", title: "LUMI Premium Modern Chandelier", qty: 45, rev: 45 * 45000 * 100 },
        { id: "prod_4", title: "LUMI Smart Wall Sconce Brass", qty: 124, rev: 124 * 5800 * 100 },
        { id: "prod_5", title: "LUMI Outdoor Floodlight 50W IP65", qty: 185, rev: 185 * 3800 * 100 }
      ];

      for (const p of products) {
        await query(
          `INSERT INTO product_sales (id, product_title, sold_quantity, revenue)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.title, p.qty, p.rev]
        );
      }

      // Seed customer_metrics
      const topCustomers = JSON.stringify([
        { first_name: "John", last_name: "Kariuki", email: "john@kariuki.co.ke", orders_count: 8, total_spent: 420000 * 100 },
        { first_name: "Sarah", last_name: "Ochieng", email: "sarah.o@gmail.com", orders_count: 5, total_spent: 280000 * 100 },
        { first_name: "Amara", last_name: "Ndegwa", email: "amara@ndegwadesigns.com", orders_count: 4, total_spent: 245000 * 100 },
        { first_name: "David", last_name: "Mutua", email: "mutua.d@outlook.com", orders_count: 3, total_spent: 180000 * 100 },
        { first_name: "Fatima", last_name: "Hassan", email: "fatima@hassanlighting.ke", orders_count: 6, total_spent: 165000 * 100 }
      ]);

      await query(
        `INSERT INTO customer_metrics (id, total_customers, new_customers_today, returning_customers, repeat_purchase_rate, top_customers)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        ["singleton", 845, 12, 254, 0.3005, topCustomers]
      );

      // Seed inventory_metrics
      await query(
        `INSERT INTO inventory_metrics (id, total_products, in_stock, out_of_stock, low_stock)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        ["singleton", 84, 72, 3, 9]
      );

      // Seed mpesa_transactions
      const mpesaTx = [
        { id: "mp_1", mreq: "ws_CO_1506_1", creq: "chk_12345", amt: 4500, phone: "254712345678", status: "success", code: 0, desc: "The service request is processed successfully.", receipt: "SFF8910J12", date: "2026-06-15 08:12:00" },
        { id: "mp_2", mreq: "ws_CO_1506_2", creq: "chk_67890", amt: 12500, phone: "254722334455", status: "success", code: 0, desc: "The service request is processed successfully.", receipt: "SFG1234A56", date: "2026-06-15 07:45:00" },
        { id: "mp_3", mreq: "ws_CO_1506_3", creq: "chk_11223", amt: 8500, phone: "254701234567", status: "failed", code: 1032, desc: "Request cancelled by user", receipt: null, date: "2026-06-15 07:10:00" },
        { id: "mp_4", mreq: "ws_CO_1506_4", creq: "chk_44556", amt: 5800, phone: "254799887766", status: "success", code: 0, desc: "The service request is processed successfully.", receipt: "SFG5678B90", date: "2026-06-15 06:30:00" },
        { id: "mp_5", mreq: "ws_CO_1506_5", creq: "chk_77889", amt: 24000, phone: "254711223344", status: "success", code: 0, desc: "The service request is processed successfully.", receipt: "SFH9012C34", date: "2026-06-14 21:15:00" },
        { id: "mp_6", mreq: "ws_CO_1506_6", creq: "chk_99001", amt: 14500, phone: "254705556677", status: "failed", code: 1, desc: "The balance is insufficient for the transaction.", receipt: null, date: "2026-06-14 18:22:00" },
        { id: "mp_7", mreq: "ws_CO_1506_7", creq: "chk_33445", amt: 9500, phone: "254720123456", status: "success", code: 0, desc: "The service request is processed successfully.", receipt: "SFI3456D78", date: "2026-06-14 15:40:00" }
      ];

      for (const tx of mpesaTx) {
        await query(
          `INSERT INTO mpesa_transaction (id, merchant_request_id, checkout_request_id, amount, phone_number, status, result_code, result_desc, mpesa_receipt_number, transaction_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [tx.id, tx.mreq, tx.creq, tx.amt, tx.phone, tx.status, tx.code, tx.desc, tx.receipt, tx.date]
        );
      }

      console.log("Analytics data warehouse seeding complete!");
    }
  } catch (e) {
    console.error("Failed to seed database, the tables might be missing or backend not running yet.", e);
  }
}

export default async function Page() {
  // Ensure tables contain data (especially for clean environments)
  await ensureDataWarehouse();

  // Initialize fallbacks
  let kpis = {
    revenueToday: 0,
    ordersToday: 0,
    revenueMonth: 0,
    ordersMonth: 0,
    avgOrderValue: 0,
    productsSold: 0,
    lowStock: 0,
    pendingOrders: 0
  };

  let inventory = {
    total_products: 0,
    in_stock: 0,
    out_of_stock: 0,
    low_stock: 0
  };

  let salesTrend: any[] = [];

  let topProducts: any[] = [];

  let mpesaTransactions = [];
  let mpesaStats = {
    total: 0,
    success: 0,
    failed: 0,
    totalAmount: 0,
    successRate: 0
  };

  let quickbooks = {
    sales: 0,
    expenses: 0,
    profit: 0,
    vatPayable: 0,
    accountsReceivable: 0,
    isMock: false
  };

  // Run database queries with error safety
  try {
    // Query Today's Stats
    const todayRes = await query(`
      SELECT 
        COALESCE(SUM(revenue), 0)::bigint as revenue,
        COALESCE(SUM(orders_count), 0)::integer as orders_count
      FROM daily_sales 
      WHERE date >= CURRENT_DATE
    `);

    // Query Month's Stats
    const monthRes = await query(`
      SELECT 
        COALESCE(SUM(revenue), 0)::bigint as revenue,
        COALESCE(SUM(orders_count), 0)::integer as orders_count
      FROM daily_sales 
      WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Query Avg Order Value
    const avgValRes = await query(`
      SELECT COALESCE(AVG(avg_order_value), 0)::bigint as avg_value 
      FROM daily_sales
    `);

    // Query Products Sold
    const prodSoldRes = await query(`
      SELECT COALESCE(SUM(sold_quantity), 0)::integer as sold 
      FROM product_sales
    `);

    // Query Inventory Metrics
    const invRes = await query(`SELECT * FROM inventory_metrics LIMIT 1`);
    if (invRes.rows.length > 0) {
      inventory = {
        total_products: invRes.rows[0].total_products,
        in_stock: invRes.rows[0].in_stock,
        out_of_stock: invRes.rows[0].out_of_stock,
        low_stock: invRes.rows[0].low_stock
      };
    }

    // Query Pending Orders
    const pendingRes = await query(`
      SELECT COUNT(*)::integer as count FROM "order" 
      WHERE deleted_at IS NULL AND (status::text = 'pending' OR status::text = 'requires_action')
    `);

    // Set KPIs from database if valid
    const revToday = Number(todayRes.rows[0]?.revenue || 0) / 100;
    const ordToday = todayRes.rows[0]?.orders_count || 0;
    const revMonth = Number(monthRes.rows[0]?.revenue || 0) / 100;
    const ordMonth = monthRes.rows[0]?.orders_count || 0;

    kpis = {
      revenueToday: revToday,
      ordersToday: ordToday,
      revenueMonth: revMonth,
      ordersMonth: ordMonth,
      avgOrderValue: (Number(avgValRes.rows[0]?.avg_value || 0) / 100),
      productsSold: prodSoldRes.rows[0]?.sold || 0,
      lowStock: inventory.low_stock,
      pendingOrders: pendingRes.rows[0]?.count || 0
    };

    // Query Sales Trend for charts
    const trendRes = await query(`
      SELECT month, revenue::bigint as revenue, orders_count::integer as orders
      FROM monthly_sales 
      ORDER BY month ASC
    `);
    if (trendRes.rows.length > 0) {
      salesTrend = trendRes.rows.map(r => ({
        month: r.month,
        revenue: Number(r.revenue) / 100,
        orders: r.orders
      }));
    }

    // Query Top Products
    const topProdRes = await query(`
      SELECT product_title as title, sold_quantity::integer as sold, revenue::bigint as revenue
      FROM product_sales 
      ORDER BY sold DESC 
      LIMIT 5
    `);
    if (topProdRes.rows.length > 0) {
      topProducts = topProdRes.rows.map(r => ({
        title: r.title,
        sold: r.sold,
        revenue: Number(r.revenue) / 100
      }));
    }

    // Query Mpesa transactions
    const mpesaRes = await query(`
      SELECT * FROM mpesa_transaction 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    mpesaTransactions = mpesaRes.rows;

    // Query Mpesa stats
    const mpesaStatsRes = await query(`
      SELECT 
        COUNT(*)::integer as total,
        COUNT(CASE WHEN status = 'success' THEN 1 END)::integer as success,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::integer as failed,
        COALESCE(SUM(amount), 0)::double precision as total_amount
      FROM mpesa_transaction
    `);
    const mStats = mpesaStatsRes.rows[0];
    if (mStats && mStats.total > 0) {
      mpesaStats = {
        total: mStats.total,
        success: mStats.success,
        failed: mStats.failed,
        totalAmount: mStats.total_amount,
        successRate: Math.round((mStats.success / mStats.total) * 1000) / 10
      };
    }

    // Fetch live QuickBooks report financials
    quickbooks = await fetchQuickBooksFinancials();
  } catch (err) {
    console.error("Failed to query live storefront DB. Showing offline demo mode data.", err);
  }

  return (
    <DashboardClient
      kpis={kpis}
      inventory={inventory}
      salesTrend={salesTrend}
      topProducts={topProducts}
      mpesaTransactions={mpesaTransactions}
      mpesaStats={mpesaStats}
      quickbooks={quickbooks}
    />
  );
}
