import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const pgConnection = req.scope.resolve("__pg_connection__");

  try {
    const store = await pgConnection.raw(`
      SELECT * FROM "store" WHERE "deleted_at" IS NULL;
    `);

    const recentCarts = await pgConnection.raw(`
      SELECT id, sales_channel_id, created_at, deleted_at 
      FROM "cart" 
      ORDER BY "created_at" DESC LIMIT 10;
    `);

    const salesChannels = await pgConnection.raw(`
      SELECT id, name, deleted_at FROM "sales_channel";
    `);

    return res.json({
      success: true,
      store: store.rows,
      recentCarts: recentCarts.rows,
      salesChannels: salesChannels.rows
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || error
    });
  }
};
